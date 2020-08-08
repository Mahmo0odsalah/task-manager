import request from "supertest";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import app from "../src/app.js";
import User from "../src/models/user";
import * as _ from "underscore";

const userOneId = new mongoose.Types.ObjectId();
const userOne = {
  _id: userOneId,
  name: "test",
  email: "test@test.com",
  password: "testing123",
  tokens: [
    {
      token: jwt.sign({ _id: userOneId }, process.env.JWT_SECRET),
    },
  ],
};
beforeEach(async () => {
  await User.deleteMany();
  await new User(userOne).save();
});

test("Should signup a new user", async () => {
  await request(app)
    .post("/users")
    .send({
      name: "Mahmood",
      email: "mahmoodAasss@gmail.com",
      password: "passw123",
    })
    .expect(201);
});

test("should login", async () => {
  const response = await request(app)
    .post("/users/login")
    .send(_.pick(userOne, ["email", "password"]))
    .expect(200);

  const user = await User.findById(userOne._id);
  expect(response.body.token).toBe(user.tokens[user.tokens.length - 1].token);
});

test("should not login bad credentials", async () => {
  await request(app)
    .post("/users/login")
    .send({ email: "wrong@wrong.com", password: "pass" })
    .expect(400);
});

test("should get profile for logged in user", async () => {
  await request(app)
    .get("/users/me")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);
});

test("should not get profile for not logged in user", async () => {
  await request(app).get("/users/me").send().expect(401);
});

test("should delete account authenticated user", async () => {
  const response = await request(app)
    .delete("/users/me")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);

  const user = await User.findById(userOne._id);
  expect(user).toBeNull();
});

test("should not delete account unauthenticated user", async () => {
  await request(app).delete("/users/me").send().expect(401);
});

test("should upload avatar", async () => {
  await request(app)
    .post("/users/me/avatar")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .attach("avatar", "tests/fixtures/avatar.jpg")
    .expect(200);
  const user = await User.findById(userOne._id);
  expect(user.avatar).toEqual(expect.any(Buffer));
});

test("should update valid user fields", async () => {
  await request(app)
    .patch("/users/me")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .field("age", 29)
    .expect(200);
  // const user = User.findById(userOne.findById)
});

afterAll(async () => {
  await User.deleteMany();
});
