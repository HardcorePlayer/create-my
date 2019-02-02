"use strict";
/**
 * create dir
 */
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const fs = require("fs");
const dist_1 = require("create-my-core");
class MakeDir extends dist_1.Task {
    /**
     * initial and validate options
     */
    constructor(context, options) {
        super(context);
        this.context = context;
        this.options = options;
        this.flag = '<mkdir>';
        this.exists = false;
        this.created = false;
        const { root } = context;
        const { _: defaults = [], dirpath: _dirpath } = options;
        const dirpath = defaults[0] || _dirpath;
        if (!dirpath)
            throw new Error(`
      ${this.flag} options.dirpath was required`);
        /**
         * make sure path was absoulte
         */
        this.target = path.resolve(dirpath);
        const relative = path.relative(root, this.target);
        /**
         * the task id should provide and unique
         */
        this.id = `mkdir(${this.target})`;
        this.title = `create dir @/${root === this.target ? '' : formatToPosixPath(relative) + '/'}`;
    }
    /**
     * validate parent dir exists, if not, create a sub task to make it
     */
    validate() {
        this.exists = isDirExists(this.target);
        if (this.exists)
            return;
        const parent = getParentPath(this.target);
        if (isDirExists(parent))
            return;
        this.dependencies.add(new MakeDir(this.context, { dirpath: parent }));
    }
    run() {
        if (this.exists)
            return dist_1.TaskResult.Skip;
        fs.mkdirSync(this.target);
        this.created = true;
        return;
    }
    rollback() {
        if (!this.created)
            return dist_1.TaskResult.Skip;
        fs.rmdirSync(this.target);
        return;
    }
}
function isDirExists(target) {
    try {
        const stats = fs.statSync(target);
        if (stats.isDirectory())
            return true;
        return false;
    }
    catch (e) {
        return false;
    }
}
function getParentPath(target) {
    const p = path.resolve(target).split(path.sep);
    p.pop();
    return p.join(path.sep);
}
function formatToPosixPath(target) {
    return target.split(path.sep).join(path.posix.sep);
}
exports.default = MakeDir;
