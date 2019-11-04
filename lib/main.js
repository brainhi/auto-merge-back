"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = __importDefault(require("@actions/core"));
const github_1 = __importDefault(require("@actions/github"));
const wait_1 = require("./wait");
const token = core_1.default.getInput("github-token", { required: true }), ms = core_1.default.getInput("milliseconds"), context = github_1.default.context, owner = context.repo.owner, repo = context.repo.repo, client = new github_1.default.GitHub(token);
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            core_1.default.debug(JSON.stringify(context.payload));
            switch (github_1.default.context.eventName) {
                case "push":
                    yield push("dev");
                    yield push("demo");
                    break;
            }
        }
        catch (err) {
            //Even if it's a valid situation, we want to fail the action in order to be able to find the issue and fix it.
            core_1.default.setFailed(err.message);
            core_1.default.debug(JSON.stringify(err));
        }
    });
}
function push(base) {
    return __awaiter(this, void 0, void 0, function* () {
        const head = "master";
        const pulls = yield client.pulls.list({
            base,
            head: `${owner}:${head}`,
            owner,
            repo,
            state: "open"
        });
        core_1.default.debug(JSON.stringify(pulls.data));
        let pull_number;
        if (pulls.data.length == 1) {
            const data = pulls.data[0];
            pull_number = data.number;
            console.log(`Pull request already exists for ${base}: #${pull_number}.`);
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
            console.log(`Pull request #${pull_number} created.`);
            core_1.default.debug(JSON.stringify(creationData));
        }
        console.log(`waiting ${ms} milliseconds before merging #${pull_number}`);
        yield wait_1.wait(parseInt(ms, 10));
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
            console.log(`Pull request #${pull_number} merged.`);
            core_1.default.debug(JSON.stringify(mergeResponse.data));
        }
        catch (err) {
            console.log("Merge failed.");
            core_1.default.debug(err);
        }
    });
}
run();
