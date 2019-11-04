"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const core = require("@actions/core");
const github = require("@actions/github");
const token = core.getInput("github-token", { required: true }), context = github.context, owner = context.repo.owner, repo = context.repo.repo, client = new github.GitHub(token);
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            core.debug(JSON.stringify(context.payload));
            switch (github.context.eventName) {
                case "push":
                    yield push("dev");
                    yield push("demo");
                    break;
            }
        }
        catch (err) {
            //Even if it's a valid situation, we want to fail the action in order to be able to find the issue and fix it.
            core.setFailed(err.message);
            core.debug(JSON.stringify(err));
        }
    });
}
function push(target) {
    return __awaiter(this, void 0, void 0, function* () {
        const head = "master", base = target;
        const pulls = yield client.pulls.list({
            base,
            head: `${owner}:${head}`,
            owner,
            repo,
            state: "open"
        });
        core.debug(JSON.stringify(pulls.data));
        let pull_number;
        if (pulls.data.length == 1) {
            const data = pulls.data[0];
            pull_number = data.number;
            core.info(`Pull request already exists: #${pull_number}.`);
        }
        else {
            const creationResponse = yield client.pulls.create({
                base,
                head,
                owner,
                repo,
                title: `${head} -> ${base} mergeback`
            }), creationData = creationResponse.data;
            pull_number = creationData.number;
            core.info(`Pull request #${pull_number} created.`);
            core.debug(JSON.stringify(creationData));
        }
        yield merge(pull_number);
    });
}
function merge(pull_number) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const mergeResponse = yield client.pulls.merge({
                owner,
                pull_number,
                repo
            });
            core.info(`Pull request #${pull_number} merged.`);
            core.debug(JSON.stringify(mergeResponse.data));
        }
        catch (err) {
            core.info("Merge failed.");
            core.debug(err);
        }
    });
}
run();
