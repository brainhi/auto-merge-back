import core from "@actions/core";
import github from "@actions/github";
import { wait } from "./wait";

const token = core.getInput("github-token", { required: true }),
  context = github.context,
  owner = context.repo.owner,
  repo = context.repo.repo,
  client = new github.GitHub(token),
  ms = core.getInput("milliseconds");

async function run() {
  try {
    core.debug(JSON.stringify(context.payload));
    switch (github.context.eventName) {
      case "push":
        await push("dev");
        await push("demo");
        break;
    }
  } catch (err) {
    //Even if it's a valid situation, we want to fail the action in order to be able to find the issue and fix it.
    core.setFailed(err.message);
    core.debug(JSON.stringify(err));
  }
}

async function push(base) {
  const head = "master";
  const pulls = await client.pulls.list({
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
    console.log(`Pull request already exists for ${base}: #${pull_number}.`);
  } else {
    const creationResponse = await client.pulls.create({
        base,
        head,
        owner,
        repo,
        title: `${head} -> ${base} mergeback`
      }),
      creationData = creationResponse.data;
    pull_number = creationData.number;
    console.log(`Pull request #${pull_number} created.`);
    core.debug(JSON.stringify(creationData));
  }
  console.log(`waiting ${ms} milliseconds before merging #${pull_number}`);
  await wait(parseInt(ms, 10));
  await merge(pull_number);
}

async function merge(pull_number) {
  try {
    const mergeResponse = await client.pulls.merge({
      owner,
      pull_number,
      repo
    });
    console.log(`Pull request #${pull_number} merged.`);
    core.debug(JSON.stringify(mergeResponse.data));
  } catch (err) {
    console.log("Merge failed.");
    core.debug(err);
  }
}

run();
