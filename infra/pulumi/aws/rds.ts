import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

export interface RdsArgs {
  projectName: string;
  environment: string;
  dbName: string;
  dbUsername: string;
  dbPassword: string;
  instanceClass: string;
  subnetIds: pulumi.Input<string>[];
  securityGroupIds: pulumi.Input<string>[];
}

export class RdsStack {
  public readonly dbInstance: aws.rds.Instance;
  public readonly dbSubnetGroup: aws.rds.SubnetGroup;
  public readonly endpoint: pulumi.Output<string>;
  public readonly connectionString: pulumi.Output<string>;

  constructor(args: RdsArgs) {
    const name = `${args.projectName}-${args.environment}`;

    // DB Subnet Group
    this.dbSubnetGroup = new aws.rds.SubnetGroup(`${name}-db-subnet-group`, {
      subnetIds: args.subnetIds,
      tags: {
        Name: `${name}-db-subnet-group`,
      },
    });

    // RDS Instance
    this.dbInstance = new aws.rds.Instance(`${name}-db`, {
      identifier: `${name}-db`,
      engine: "postgres",
      engineVersion: "16",
      instanceClass: args.instanceClass,
      allocatedStorage: 20,
      storageType: "gp2",
      dbName: args.dbName,
      username: args.dbUsername,
      password: args.dbPassword,
      dbSubnetGroupName: this.dbSubnetGroup.name,
      vpcSecurityGroupIds: args.securityGroupIds,
      publiclyAccessible: false,
      skipFinalSnapshot: true, // 開発環境用。本番環境では false にする
      backupRetentionPeriod: 7,
      backupWindow: "03:00-04:00",
      maintenanceWindow: "mon:04:00-mon:05:00",
      tags: {
        Name: `${name}-db`,
        Environment: args.environment,
      },
    });

    this.endpoint = this.dbInstance.endpoint;

    // PostgreSQL接続文字列
    this.connectionString = pulumi.interpolate`postgresql://${args.dbUsername}:${args.dbPassword}@${this.dbInstance.endpoint}/${args.dbName}`;
  }
}
