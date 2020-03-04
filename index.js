const core = require("@actions/core");
const github = require("@actions/github");

async function run() {
  try {
    const jobStatusSuccess = 'Success'
    const jobStatusFailure = 'Failure'
    const jobStatusPending = 'Pending'

    const deployStateSuccess = 'success'
    const deployStateFailure = 'failure'
    const deployStatePending = 'pending'

    const context = github.context;
    const defaultUrl = `https://github.com/${context.repo.owner}/${context.repo.repo}/commit/${context.sha}/checks`;

    const token = core.getInput('token', {required: true});
    const jobStatus = core.getInput('status', {required: true});
    const url = core.getInput('log-url', {required: false}) || defaultUrl;
    const description = core.getInput('description', {required: false});
    const env = core.getInput('environment', {required: false});
    const envUrl = core.getInput('environment-url', {required: false});

    let deployState = deployStatePending 
    if (jobStatus == jobStatusSuccess) {
      deployState = deployStateSuccess
    } else if  (jobStatus == jobStatusFailure) {
      deployState = deployStateFailure
    }

    const client = new github.GitHub(token);
    const params = {
      ...context.repo,
      deployment_id: context.payload.deployment.id,
      state: deployState,
      log_url: url,
      target_url: url,
      description,
    };
    if (env) {
      params.environment = env;
    }
    if (envUrl) {
      params.environment_url = envUrl;
    }
    await client.repos.createDeploymentStatus(params);
  } catch (error) {
    core.error(error);
    core.setFailed(error.message);
  }
}

run();
