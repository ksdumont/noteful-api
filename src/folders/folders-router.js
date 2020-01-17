const path = require('path')
const express = require('express')
const FoldersService = require('./folders-service')

const foldersRouter = express.Router()
const jsonParser = express.json()

foldersRouter
.route('/')
.get((req, res, next) => {
    FoldersService.getAllFolders(req.app.get('db')
    )
    .then(folders => {
        res.json(folders)
    })
    .catch(next)
})
.post(jsonParser, (req, res, next) => {
    const {title} = req.body
    const newFolder = {title}

    if (!title) {
        return res.status(400).json({
            error: {message: `Missing title in request body`}
        })
    }
    FoldersService.insertFolder(req.app.get('db'), newFolder)
    .then(folder => {
        res
        .status(201)
        .location(path.posix.join(req.originalUrl, `/${folder.id}`))
        .json(folder)
    })
    .catch(next)
})
foldersRouter
.route('/:id')
.all((req, res, next) => {
    FoldersService.getById(req.app.get('db'), req.params.id)
    .then(folder => {
        if (!folder) {
            return res.status(404).json({error: {message: `Folder doesn't exist`}})
        }
        res.folder = folder
        next()
    })
    .catch(next)
})
.get((req, res, next) => {
    res.json(res.folder)
})
.delete((req, res, next) => {
    FoldersService.deleteFolder(req.app.get('db'), req.params.id)
    .then(() => {
        res.status(204).end()
    })
    .catch(next)
})
.patch(jsonParser, (req, res, next) => {
    const {title} = req.body
    const folderToUpdate = {title}

    if (!title) {
        return res.status(400).json({
            error: {message: `Missing title in request body`}
        })
    }
    FoldersService.updateFolder(req.app.get('db'), req.params.id, folderToUpdate)
    .then(() => {
        res.status(204).end()
    })
    .catch(next)
})

module.exports = foldersRouter;