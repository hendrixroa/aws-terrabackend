import * as aws from 'aws-sdk';
import { prompt } from 'enquirer';

const s3 = new aws.S3();
const user: string = 'deploy';

export class BackendTF {

  constructor() {
    
  }

  private async createS3Bucket(bucketName: string, region: string) {
    const params = {
      Bucket: bucketName,
      ACL: 'private',
      CreateBucketConfiguration: {
        LocationConstraint: region
      },
    };
    await s3.createBucket(params).promise();

    const publicAccess = {
      Bucket: bucketName,
      PublicAccessBlockConfiguration: {
        BlockPublicAcls: true,
        BlockPublicPolicy: true,
        IgnorePublicAcls: true,
        RestrictPublicBuckets: true,
      },
    };
    await s3.putPublicAccessBlock(publicAccess).promise();

    const bucketEncryption = {
      Bucket: bucketName,
      ServerSideEncryptionConfiguration: {
        Rules: [
          {
            ApplyServerSideEncryptionByDefault: {
              SSEAlgorithm: 'AES256',
            },
          },
        ],
      },
    };
    await s3.putBucketEncryption(bucketEncryption).promise();

    console.log(`Bucket ${bucketName} Created.`);
  }

  public async init() {

    const { repoName } = await prompt({
      type: 'input',
      name: 'repoName',
      message: 'Name of repository or project?',
    });

    const { region } = await prompt({
      type: 'input',
      name: 'region',
      message: 'Region?',
      initial: 'us-east-2'
    });

  }
}

const backend: BackendTF = new BackendTF();
backend
  .init()
  .then()
  .catch();
