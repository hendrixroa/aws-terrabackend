#!/usr/bin/env node

import * as aws from 'aws-sdk';
import { prompt } from 'enquirer';
import * as fs from 'fs';

export class BackendTF {

  private async createS3Bucket(bucketName: string, region: string) {
    const s3 = new aws.S3();

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

    const bucketVersioning = {
      Bucket: bucketName,
      VersioningConfiguration: {
        MFADelete: 'Disabled', 
        Status: 'Enabled',
      },
    }
    await s3.putBucketVersioning(bucketVersioning).promise();

    console.info(`Bucket ${bucketName} Created.`);
  }

  private async createDynamoDBTable(name: string) {
    
    const dynamodb = new aws.DynamoDB();

    const params = {
      TableName : name,
      KeySchema: [       
        { AttributeName: 'LockID', KeyType: 'HASH'},
      ],
      AttributeDefinitions: [       
        { AttributeName: 'LockID', AttributeType: 'S' },
      ],
      ProvisionedThroughput: {       
        ReadCapacityUnits: 5, 
        WriteCapacityUnits: 5,
      },
    };
    await dynamodb.createTable(params).promise();

    console.info(`DynamoDB Table ${name} is created!`)
  }

  public async init() {

    const { repoName } = await prompt({
      type: 'input',
      name: 'repoName',
      message: 'Name of repository or project?',
    });

    const { nameFileBackend } = await prompt({
      type: 'input',
      name: 'nameFileBackend',
      message: 'Name of file tfbackend?',
      initial: 'staging.tfbackend',
    });

    const { region } = await prompt({
      type: 'input',
      name: 'region',
      message: 'Region?',
      initial: 'us-east-2',
    });

    aws.config.update({ region });

    await this.createS3Bucket(`${repoName}-state`, region);
    await this.createDynamoDBTable(`${repoName}_lock`);

    // Generate <name>.tfbackend file
    const backendFileContent = 
`
bucket = "${repoName}_state"
key    = "state.tfstate"
region = "${region}"
dynamodb_table = "${repoName}_lock"
`;

    fs.writeFileSync(`${nameFileBackend}.tfbackend`, backendFileContent);
    console.info(`Backend file: ${nameFileBackend}.tfbackend generated successfully`);
  }
}

const backend: BackendTF = new BackendTF();
backend.init().catch((err: any) => { console.error(err); });
