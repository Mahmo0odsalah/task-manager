import express from "express";
import Task from "../models/task.js";
import auth from "../middleware/auth.js";
import { checkCache, setCache, deletCache } from "../middleware/cache.js";
import axios from "axios";
const router = express.Router();

router.post("/tasks", auth, async (req, res) => {
  const task = new Task({ ...req.body, owner: req.user._id });
  try {
    await task.save();
    res.status(201).send(task);
  } catch (error) {
    res.status(400).send(error);
  }
});
//GET /tasks?sortBy=createdAt:desc
router.get("/tasks", auth, async (req, res) => {
  try {
    const user = req.user;
    const match = {};
    const sort = {};
    if (req.query.completed === "true") {
      match.completed = true;
    } else if (req.query.completed === "false") {
      match.completed = false;
    }
    if (req.query.sortBy) {
      const parts = req.query.sortBy.split(":");
      sort[parts[0]] = parts[1] === "desc" ? -1 : 1;
    }
    await user
      .populate({
        path: "tasks",
        match,
        options: {
          limit: parseInt(req.query.limit || 10),
          skip: parseInt(req.query.skip),
          sort,
        },
      })
      .execPopulate();
    const tasks = user.tasks;

    res.send(tasks);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.get("/tasks/:id", auth, async (req, res) => {
  const _id = req.params.id;
  try {
    let task = await Task.findOne({ _id, owner: req.user._id });
    if (!task) {
      res.status(404).send(task);
    }
    const task_date = new Date(task.createdAt);
    const url = `https://byabbe.se/on-this-day/${
      task_date.getMonth() + 1
    }/${task_date.getDate()}/events.json`;
    checkCache(`${task_date.getMonth() + 1}_${task_date.getDate()}`)
      .then((reply) => {
        task = { onThisDay: JSON.parse(reply), ...task._doc };
        return res.send(task);
      })
      .catch((err) => {
        axios
          .get(url)
          .then(async (response) => {
            const onThisDay = response.data.events[0];
            task = { onThisDay, ...task._doc };
            await setCache(
              `${task_date.getMonth() + 1}_${task_date.getDate()}`,
              JSON.stringify(onThisDay)
            );
            return res.send(task);
          })
          .catch((err) => {
            return res.status(500).send(err);
          });
      });
  } catch (error) {
    res.status(400).send(error);
  }
});

router.patch("/tasks/:id", auth, async (req, res) => {
  const _id = req.params.id;
  const newUpdates = Object.keys(req.body);
  const allowedUpdates = ["description", "completed"];
  const isAllowed = newUpdates.every((update) => {
    return allowedUpdates.includes(update);
  });
  if (!isAllowed) {
    return res.status(400).send("Update inculdes one or more not allowed keys");
  }
  try {
    const task = await Task.findOne({ _id, owner: req.user._id });

    if (!task) {
      return res.status(404).send();
    }
    newUpdates.forEach((update) => {
      task[update] = req.body[update];
    });
    await task.save();
    setCache(_id, task);
    return res.send(task);
  } catch (error) {
    return res.status(400).send(error);
  }
});

router.delete("/tasks/:id", auth, async (req, res) => {
  const _id = req.params.id;
  try {
    const task = await Task.findOneAndDelete({ _id, owner: req.user._id });
    if (!task) {
      return res.status(404).send();
    }
    deletCache(_id);
    res.send(task);
  } catch (error) {
    res.status(400).send(error);
  }
});
// router.patch("/tasks/:id", async (req, res) => {
//   const _id = req.params.id;
//   try {
//     const task = await Task.findByIdAndUpdate(id, {
//       $set: { completed: true },
//     });
//     const count = await Task.countDocuments({ completed: false });
//     if (!task) {
//       return res.status(404).send();
//     }
//     res.send({ count });
//   } catch (error) {
//     res.status(400).send(error);
//   }
// });

export default router;
