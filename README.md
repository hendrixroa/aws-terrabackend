# AWS Terraform Backend

CLI that helps you to configure the remote state  [S3 State](https://www.terraform.io/docs/backends/types/s3.html#using-the-s3-remote-state) in AWS creating the S3 bucket and the dynamoDB table to lock the state.

## Install

- Run `yarn global add aws-terrabackend`
- The command name is `terrabackend`

### How to use

1. Through AWS console create new IAM user called `deploy` (or whatever you want) with programmatic access only and attach to him `AdministratorAccess` policy and save access key id/secret (id/secret can passed to terraform via standard env vars `AWS_PROFILE`).

1. Once you installed `terrabackend`, configure the aws-cli profile [configure profile](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-configure.html) that will be use by `terrabackend`.

1. Run `terrabackend` with the Profile needed, for example:

```sh
$ AWS_PROFILE=myprofile terrabackend
```

1. terrabackend command will ask you by the name of bucket, name of tfbackend file and region.

1. It will generate a .tfbackend (in the current path) to be used in your Terraform backend. More info [TF Backend](https://www.terraform.io/docs/backends/types/s3.html)
