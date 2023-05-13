const chai = require("chai");
const chaiHttp = require("chai-http");
const app = require("./app");

chai.use(chaiHttp);
const expect = chai.expect;

describe("Message App", () => {
  describe("Form Submission", () => {
    it("should return an error when submitting an empty message", (done) => {
      chai
        .request(app)
        .post("/messages")
        .send({ message: "" })
        .end((err, res) => {
          expect(res).to.have.status(400);
          expect(res.body).to.have.property("error");
          done();
        });
    });

    it("should return an error when submitting a message longer than 140 characters", (done) => {
      chai
        .request(app)
        .post("/messages")
        .send({
          message:
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit.. Pellentesque interdum rutrum sodales. Nullam mattis fermentum libero, non volutpat. ",
        })
        .end((err, res) => {
          expect(res).to.have.status(400);
          expect(res.body).to.have.property("error");
          done();
        });
    });

    it("should create a new message when submitting a valid message", (done) => {
      chai
        .request(app)
        .post("/messages")
        .send({ message: "Test message" })
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body)
            .to.have.property("message")
            .that.equals("Message created successfully");
          done();
        });
    });
  });

  describe("Message Retrieval", () => {
    it("should retrieve all messages in reverse order", (done) => {
      chai
        .request(app)
        .get("/messages")
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.text).to.include("<li>Test message -");
          done();
        });
    });
  });

  describe("Message Deletion", () => {
    it("should return a 404 when deleting a message that does not exist", (done) => {
      chai
        .request(app)
        .delete("/messages/999999")
        .end((err, res) => {
          expect(res).to.have.status(404);
          done();
        });
    });

    it("should delete a message when deleting a message that exists", (done) => {
      chai
        .request(app)
        .delete("/messages/1")
        .end((err, res) => {
          expect(res).to.have.status(200);
          done();
        });
    });
  });
});
