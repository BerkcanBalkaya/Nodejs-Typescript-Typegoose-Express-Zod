import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import supertest from "supertest";
import { any } from "zod";
import { createDiary } from "../service/diary.service";
import { signJwt } from "../utils/jwt";
import createServer from "../utils/server";
import {
  randomId,
  diaryPayload,
  diaryPayload2,
  diaryUserPayload,
  diaryUserPayload2,
} from "./payloads/diary.payload";

const app = createServer();

let jwtKey = signJwt(diaryUserPayload, "accessTokenPrivateKey", {
  expiresIn: "60m",
});

describe("diary", () => {
  beforeEach(async () => {
    const mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
  });
  
  afterEach(async () => {
    await mongoose.disconnect();
    await mongoose.connection.close();
  });

  describe("getAll diary route", () => {
    describe("given the user is not logged in", () => {
      it("should return a 403", async () => {
        const outcome = await supertest(app).get("/api/diaries");

        expect(outcome.statusCode).toBe(403);
      });
    });
    describe("given the user is logged in", () => {
      it("should return a 200 and all the diaries user own", async () => {
        await createDiary(diaryPayload);
        await createDiary(diaryPayload2);
        const outcome = await supertest(app)
          .get("/api/diaries")
          .set("Authorization", `Bearer ${jwtKey}`);

        expect(outcome.statusCode).toBe(200);
        expect(outcome.body.body).toEqual([
          {
            _id: expect.any(String),
            title: "test diary 1",
            body: "test body 1",
            user: expect.any(String),
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
            __v: 0,
          },
          {
            _id: expect.any(String),
            title: "test diary 2",
            body: "test body 2",
            user: expect.any(String),
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
            __v: 0,
          },
        ]);
      });
    });
    describe("given the user is logged in but doesn't have any diary", () => {
      it("should return a 404 and appropriate message", async () => {
        const outcome = await supertest(app)
          .get("/api/diaries")
          .set("Authorization", `Bearer ${jwtKey}`);

        expect(outcome.statusCode).toBe(404);
        expect(outcome.body.message).toEqual("Size ait diary bulunmamakta.");
      });
    });
  });

  describe("get diary route", () => {
    describe("given the user is not logged in", () => {
      it("should return a 403", async () => {
        const diaryId = randomId;
        const outcome = await supertest(app).get(`/api/diaries/${diaryId}`);

        expect(outcome.statusCode).toBe(403);
      });
    });
    describe("given the user is logged in but diary does not exist", () => {
      it("should return 404 and appropriate message", async () => {
        const diaryId = randomId;

        const outcome = await supertest(app)
          .get(`/api/diaries/${diaryId}`)
          .set("Authorization", `Bearer ${jwtKey}`);

        expect(outcome.statusCode).toBe(404);
        expect(outcome.body.message).toEqual(
          "L??tfen bu id ye ait bir diary oldu??una emin olun"
        );
      });
    });
    describe("given the user is logged in and diary does exist", () => {
      it("should return 200 and the diary", async () => {
        const diary = await createDiary(diaryPayload);

        const outcome = await supertest(app)
          .get(`/api/diaries/${diary._id.toString()}`)
          .set("Authorization", `Bearer ${jwtKey}`);

        expect(outcome.statusCode).toBe(200);

        expect(outcome.body.body._id).toEqual(diary._id.toString());
      });
    });
    describe("given the user is logged in and diary does exist but it's not user's diary", () => {
      beforeEach(async () => {
        jwtKey = await signJwt(diaryUserPayload2, "accessTokenPrivateKey", {
          expiresIn: "60m",
        });
      });
      afterEach(async () => {
        jwtKey = await signJwt(diaryUserPayload, "accessTokenPrivateKey", {
          expiresIn: "60m",
        });
      });
      it("should return 403 and the appropriate message", async () => {
        const diary = await createDiary(diaryPayload);
        const outcome = await supertest(app)
          .get(`/api/diaries/${diary._id.toString()}`)
          .set("Authorization", `Bearer ${jwtKey}`);

        expect(outcome.statusCode).toBe(403);

        expect(outcome.body.message).toEqual(
          "L??tfen incelemek istedi??iniz diary'nin size ait oldu??undan emin olun"
        );
      });
    });
  });
  describe("create diary route", () => {
    describe("given the user is not logged in", () => {
      it("should return a 403", async () => {
        const outcome = await supertest(app)
          .post("/api/diaries")
          .send(diaryPayload);

        expect(outcome.statusCode).toBe(403);
      });
    });
    describe("given the user is logged in", () => {
      it("should return a 200 and create the diary", async () => {
        const outcome = await supertest(app)
          .post("/api/diaries")
          .set("Authorization", `Bearer ${jwtKey}`)
          .send(diaryPayload);

        expect(outcome.statusCode).toBe(200);

        expect(outcome.body.body).toEqual({
          title: "test diary 1",
          body: "test body 1",
          user: expect.any(String),
          _id: expect.any(String),
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
          __v: 0,
        });
      });
    });
    describe("given the user is logged in but diary title already exist", () => {
      it("should return a 409 and diary body that used in creating", async () => {
        await createDiary(diaryPayload);
        const outcome = await supertest(app)
          .post("/api/diaries")
          .set("Authorization", `Bearer ${jwtKey}`)
          .send(diaryPayload);

        expect(outcome.statusCode).toBe(409);

        expect(outcome.body.body).toEqual({
          title: diaryPayload.title,
          body: diaryPayload.body,
          user: diaryPayload.user.toString(),
        });
      });
    });
  });
  describe("delete diary route", () => {
    describe("given the user is not logged in", () => {
      it("should return a 403", async () => {
        const diaryId = randomId;
        const outcome = await supertest(app).delete(`/api/diaries/${diaryId}`);

        expect(outcome.statusCode).toBe(403);
      });
    });
    describe("given the user is logged in but diary does not exist", () => {
      it("should return 404 and appropriate message", async () => {
        const diaryId = randomId;
        const outcome = await supertest(app)
          .delete(`/api/diaries/${diaryId}`)
          .set("Authorization", `Bearer ${jwtKey}`);

        expect(outcome.statusCode).toBe(404);
        expect(outcome.body.message).toEqual(
          "L??tfen bu id ye ait bir diaryi oldu??undan emin olun"
        );
      });
    });
    describe("given the user is logged in and diary does exist", () => {
      it("should return a 200 and deleted diary", async () => {
        const diary = await createDiary(diaryPayload);
        const outcome = await supertest(app)
          .delete(`/api/diaries/${diary._id.toString()}`)
          .set("Authorization", `Bearer ${jwtKey}`);
        console.log(outcome.body.body);
        console.log(diary);
        expect(outcome.statusCode).toBe(200);
        expect(outcome.body.body).toEqual({
          _id: diary._id.toString(),
          title: diary.title,
          body: diary.body,
          user: diary.user?.toString(),
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
          __v: expect.any(Number),
        });
      });
    });
    describe("given the user is logged in and diary does exist but it's not user's diary", () => {
      beforeEach(async () => {
        jwtKey = await signJwt(diaryUserPayload2, "accessTokenPrivateKey", {
          expiresIn: "60m",
        });
      });
      afterEach(async () => {
        jwtKey = await signJwt(diaryUserPayload, "accessTokenPrivateKey", {
          expiresIn: "60m",
        });
      });
      it("should return 403 and the appropriate message", async () => {
        const diary = await createDiary(diaryPayload);
        const outcome = await supertest(app)
          .delete(`/api/diaries/${diary._id.toString()}`)
          .set("Authorization", `Bearer ${jwtKey}`);

        expect(outcome.statusCode).toBe(403);

        expect(outcome.body.message).toEqual(
          "L??tfen silmek istedi??iniz diary'nin size ait oldu??undan emin olun"
        );
      });
    });
  });
  describe("update diary route", () => {
    describe("given the user is not logged in", () => {
      it("should return a 403", async () => {
        const diaryId = randomId;
        const outcome = await supertest(app)
          .put(`/api/diaries/${diaryId}`)
          .send(diaryPayload);

        expect(outcome.statusCode).toBe(403);
      });
    });
    describe("given the user is logged in but diary does not exist", () => {
      it("should return a 404 and diaryId pathVariable", async () => {
        const diaryId = randomId;
        const outcome = await supertest(app)
          .put(`/api/diaries/${diaryId}`)
          .set("Authorization", `Bearer ${jwtKey}`)
          .send(diaryPayload);

        expect(outcome.statusCode).toBe(404);
        expect(outcome.body.body).toEqual(diaryId.toString());
      });
    });
    describe("given the user is logged in and diary does exist", () => {
      it("should return a 200 and return updated diary", async () => {
        const diary = await createDiary(diaryPayload);
        const outcome = await supertest(app)
          .put(`/api/diaries/${diary._id.toString()}`)
          .set("Authorization", `Bearer ${jwtKey}`)
          .send(diaryPayload2);

        console.log(outcome.body.body);
        console.log(diaryPayload2);

        expect(outcome.statusCode).toBe(200);
        expect(outcome.body.body).toEqual({
          _id: diary._id.toString(),
          title: diaryPayload2.title,
          body: diaryPayload2.body,
          user: diary.user?.toString(),
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
          __v: expect.any(Number),
        });
      });
    });
    describe("given the user is logged in and diary does exist but it's not user's diary", () => {
      beforeEach(async () => {
        jwtKey = await signJwt(diaryUserPayload2, "accessTokenPrivateKey", {
          expiresIn: "60m",
        });
      });
      afterEach(async () => {
        jwtKey = await signJwt(diaryUserPayload, "accessTokenPrivateKey", {
          expiresIn: "60m",
        });
      });
      it("should return 403 and the appropriate message", async () => {
        const diary = await createDiary(diaryPayload);
        const outcome = await supertest(app)
          .put(`/api/diaries/${diary._id.toString()}`)
          .set("Authorization", `Bearer ${jwtKey}`)
          .send(diaryPayload2);

        expect(outcome.statusCode).toBe(403);
        expect(outcome.body.message).toEqual(
          "L??tfen g??ncellemek istedi??iniz diary'nin size ait oldu??undan emin olun"
        );
      });
    });
  });
});
