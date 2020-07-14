import express from "express";
import User from "../models/user.js";
import auth from "../middleware/auth.js";
import multer from "multer";
import sharp from "sharp";
import { sendWelcomeEmail, sendCancellationEmail } from "../emails/account.js";

const router = express.Router();

router.post("/users", async (req, res) => {
  const user = new User(req.body);
  try {
    const token = await user.generateAuthToken();
    await user.save();
    sendWelcomeEmail(user.email, user.name);
    return res.status(201).send({ user, token });
  } catch (error) {
    return res.status(400).send(error);
  }
});
router.post("/users/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findByCredentials(email, password);
    const token = await user.generateAuthToken();
    res.send({ user, token });
  } catch (error) {
    res.status(400).send(error);
  }
});

router.post("/users/logout", auth, async (req, res) => {
  try {
    const user = req.user;
    const token = req.token;
    user.tokens = user.tokens.filter((tok) => {
      return tok.token !== token;
    });
    await user.save();
    res.send();
  } catch (error) {
    res.status(500).send(error);
  }
});

router.post("/users/logoutAll", auth, async (req, res) => {
  try {
    const user = req.user;
    user.tokens = [];
    await user.save();
    res.send();
  } catch (error) {
    res.status(500).send(error);
  }
});

//Upload Avatar

const uploadAvatar = multer({
  limits: {
    fileSize: 2000000,
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error("File must be an image"));
    }
    cb(undefined, true);
  },
});

router.post(
  "/users/me/avatar",
  auth,
  uploadAvatar.single("avatar"),
  async (req, res) => {
    req.user.avatar = await sharp(req.file.buffer)
      .resize({ width: 250, height: 250 })
      .png()
      .toBuffer();
    await req.user.save();
    res.send();
  },
  (error, req, res, next) => {
    res.status(400).send({ error: error.message });
  }
);
router.get("/users/me", auth, async (req, res) => {
  res.send(req.user);
});

router.get("/users/:id/avatar", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || !user.avatar) {
      return res.status(404).send();
    }

    res.set("Content-Type", "image/png");
    res.send(user.avatar);
  } catch (error) {
    res.status(400).send();
  }
});
// router.get("/users/:id", auth, async (req, res) => {
//   try {
//     const _id = req.params.id;
//     const user = await User.findById(_id);
//     if (!user) {
//       res.status(404).send();
//     }
//     return res.send(user);
//   } catch (error) {
//     console.error(error);
//     return res.status(400).send(error);
//   }
// });

router.patch("/users/me", auth, async (req, res) => {
  try {
    Object.keys(req.body).forEach((key) => {
      req.user[key] = req.body[key];
    });

    await req.user.save();

    res.send(req.user);
  } catch (error) {
    res.status(400).send(error);
  }
});

router.delete("/users/me", auth, async (req, res) => {
  const _id = req.user._id;
  try {
    await req.user.remove();
    sendCancellationEmail(req.user.email, req.user.name);
    return res.send(req.user);
  } catch (error) {
    res.status(400).send(error);
  }
});

router.delete("/users/me/avatar", auth, async (req, res) => {
  req.user.avatar = undefined;
  try {
    await req.user.save();
    res.send();
  } catch (error) {
    res.status(400).send(error);
  }
});

export default router;
