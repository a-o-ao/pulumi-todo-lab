import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

export interface VpcArgs {
    projectName: string;
    environment: string;
}

export class VpcStack {
    public readonly vpc: aws.ec2.Vpc;
    public readonly publicSubnet1: aws.ec2.Subnet;
    public readonly publicSubnet2: aws.ec2.Subnet;
    public readonly privateSubnet1: aws.ec2.Subnet;
    public readonly privateSubnet2: aws.ec2.Subnet;
    public readonly internetGateway: aws.ec2.InternetGateway;
    public readonly publicRouteTable: aws.ec2.RouteTable;

    constructor(args: VpcArgs) {
        const name = `${args.projectName}-${args.environment}`;

        // VPC
        this.vpc = new aws.ec2.Vpc(`${name}-vpc`, {
            cidrBlock: "10.0.0.0/16",
            enableDnsHostnames: true,
            enableDnsSupport: true,
            tags: {
                Name: `${name}-vpc`,
                Environment: args.environment,
            },
        });

        // Internet Gateway
        this.internetGateway = new aws.ec2.InternetGateway(`${name}-igw`, {
            vpcId: this.vpc.id,
            tags: {
                Name: `${name}-igw`,
            },
        });

        // Public Subnets (2つのAZ)
        this.publicSubnet1 = new aws.ec2.Subnet(`${name}-public-subnet-1`, {
            vpcId: this.vpc.id,
            cidrBlock: "10.0.1.0/24",
            availabilityZone: "ap-northeast-1a",
            mapPublicIpOnLaunch: true,
            tags: {
                Name: `${name}-public-subnet-1`,
                Type: "public",
            },
        });

        this.publicSubnet2 = new aws.ec2.Subnet(`${name}-public-subnet-2`, {
            vpcId: this.vpc.id,
            cidrBlock: "10.0.2.0/24",
            availabilityZone: "ap-northeast-1c",
            mapPublicIpOnLaunch: true,
            tags: {
                Name: `${name}-public-subnet-2`,
                Type: "public",
            },
        });

        // Private Subnets (RDS用)
        this.privateSubnet1 = new aws.ec2.Subnet(`${name}-private-subnet-1`, {
            vpcId: this.vpc.id,
            cidrBlock: "10.0.11.0/24",
            availabilityZone: "ap-northeast-1a",
            tags: {
                Name: `${name}-private-subnet-1`,
                Type: "private",
            },
        });

        this.privateSubnet2 = new aws.ec2.Subnet(`${name}-private-subnet-2`, {
            vpcId: this.vpc.id,
            cidrBlock: "10.0.12.0/24",
            availabilityZone: "ap-northeast-1c",
            tags: {
                Name: `${name}-private-subnet-2`,
                Type: "private",
            },
        });

        // Route Table for Public Subnets
        this.publicRouteTable = new aws.ec2.RouteTable(`${name}-public-rt`, {
            vpcId: this.vpc.id,
            tags: {
                Name: `${name}-public-rt`,
            },
        });

        // Route to Internet Gateway
        new aws.ec2.Route(`${name}-public-route`, {
            routeTableId: this.publicRouteTable.id,
            destinationCidrBlock: "0.0.0.0/0",
            gatewayId: this.internetGateway.id,
        });

        // Associate Route Table with Public Subnets
        new aws.ec2.RouteTableAssociation(`${name}-public-rta-1`, {
            subnetId: this.publicSubnet1.id,
            routeTableId: this.publicRouteTable.id,
        });

        new aws.ec2.RouteTableAssociation(`${name}-public-rta-2`, {
            subnetId: this.publicSubnet2.id,
            routeTableId: this.publicRouteTable.id,
        });
    }
}
