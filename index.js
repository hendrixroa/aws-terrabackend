#!/usr/bin/env node
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const aws = require("aws-sdk");
const enquirer_1 = require("enquirer");
const s3 = new aws.S3();
const user = 'deploy';
class BackendTF {
    constructor() {
    }
    createS3Bucket(bucketName, region) {
        return __awaiter(this, void 0, void 0, function* () {
            const params = {
                Bucket: bucketName,
                ACL: 'private',
                CreateBucketConfiguration: {
                    LocationConstraint: region
                },
            };
            yield s3.createBucket(params).promise();
            const publicAccess = {
                Bucket: bucketName,
                PublicAccessBlockConfiguration: {
                    BlockPublicAcls: true,
                    BlockPublicPolicy: true,
                    IgnorePublicAcls: true,
                    RestrictPublicBuckets: true,
                },
            };
            yield s3.putPublicAccessBlock(publicAccess).promise();
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
            yield s3.putBucketEncryption(bucketEncryption).promise();
            console.log(`Bucket ${bucketName} Created.`);
        });
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('Profile: ', process.env.AWS_PROFILE);
            const { repoName } = yield enquirer_1.prompt({
                type: 'input',
                name: 'repoName',
                message: 'Name of repository or project?',
            });
            const { region } = yield enquirer_1.prompt({
                type: 'input',
                name: 'region',
                message: 'Region?',
                initial: 'us-east-2'
            });
        });
    }
}
exports.BackendTF = BackendTF;
const backend = new BackendTF();
backend.init().catch(() => { });
