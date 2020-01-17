const path = require("path");
const express = require("express");
const NotesService = require("./notes-service");

const notesRouter = express.Router();
const jsonParser = express.json();

notesRouter
  .route("/")
  .get((req, res, next) => {
    NotesService.getAllNotes(req.app.get("db"))
      .then(notes => {
        res.json(notes);
      })
      .catch(next);
  })
  .post(jsonParser, (req, res, next) => {
    const { title, folder, content } = req.body;
    const newNote = { title, folder, content };

    for (const [key, value] of Object.entries(newNote)) {
        if (value == null) {
            return res.status(400).json({
                error: {message: `Missing '${key}' in request body`}
            })
        }
    }
    /* Add Error handling if Folder does not exist ? */
    
    NotesService.insertNote(req.app.get("db"), newNote)
      .then(note => {
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `/${note.id}`))
          .json(note);
      })
      .catch(next);
  });
notesRouter.route("/:id")
  .all((req, res, next) => {
    NotesService.getById(req.app.get("db"), req.params.id)
      .then(note => {
        if (!note) {
          return res
            .status(404)
            .json({ error: { message: `note doesn't exist` } });
        }
        res.note = note;
        next();
      })
      .catch(next);
  })
  .get((req, res, next) => {
    res.json(res.note);
  })
  .delete((req, res, next) => {
    NotesService.deleteNote(req.app.get("db"), req.params.id)
      .then(() => {
        res.status(204).end();
      })
      .catch(next);
  })
  .patch(jsonParser, (req, res, next) => {
    const { title, folder, content } = req.body;
    const noteToUpdate = { title, folder, content };

    const numberOfValues = Object.values(noteToUpdate).filter(Boolean).length

    if(numberOfValues === 0) {
        return res.status(400).json({
            error: {
                message: `Request body must contain either 'title', 'style', or 'content'`
            }
        })
    }
    NotesService.updateNote(req.app.get("db"), req.params.id, noteToUpdate)
      .then(() => {
        res.status(204).end();
      })
      .catch(next);
  });

module.exports = notesRouter;
