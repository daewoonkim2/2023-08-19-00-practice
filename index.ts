import * as aws from "@pulumi/aws";

const size = "t2.micro";     // t2.micro is available in the AWS free tier
const ami = aws.ec2.getAmi({
    filters: [{
        name: "name",
        values: ["amzn-ami-hvm-*"],
    }],
    owners: [/*"538679150053"*/ /*"538679150053"*/ "137112412989" /* This owner ID is Amazon*/], 
    mostRecent: true,
});

const group = new aws.ec2.SecurityGroup("webserver-secgrp", {
    ingress: [
        { protocol: "tcp", fromPort: 22, toPort: 22, cidrBlocks: ["0.0.0.0/0"] },
        { protocol: "tcp", fromPort: 80, toPort: 80, cidrBlocks: ["0.0.0.0/0"] },
        { protocol: "tcp", fromPort: 5000, toPort: 5000, cidrBlocks: ["0.0.0.0/0"] },
    ],
});


const userData = // <-- ADD THIS DEFINITION
`#!/bin/bash
pip3 install mlflow
echo "Hello, World!" > index.html
nohup python -m SimpleHTTPServer 80 &
nohup python3 -m mlflow server &`;


const server = new aws.ec2.Instance("webserver-www", {
    instanceType: size,
    vpcSecurityGroupIds: [ group.id ], // reference the security group resource above
    ami: ami.then (res => {return res.id}),
    userData: userData,             // <-- ADD THIS LINE
});


export const publicIp = server.publicIp;
export const publicHostName = server.publicDns;



