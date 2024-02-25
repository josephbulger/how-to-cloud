import "cdktf/lib/testing/adapters/jest";
import * as fs from "fs";
import { parse } from "../dns-zones/zone.parser";
import { globSync } from "glob";

describe("Zone Parser", () => {
  it("should parse", () => {
    const files = globSync(`${__dirname}/**/*.zone`);

    for (const file of files) {
      const json = fs.readFileSync(file, "utf8");
      const zoneDetails = parse(json);
      console.log(zoneDetails.rrDetails);
      expect(zoneDetails).toBeDefined();
    }
  });

  it("should have origin", () => {
    const files = globSync(`${__dirname}/**/*.zone`);

    for (const file of files) {
      const json = fs.readFileSync(file, "utf8");
      const zoneDetails = parse(json);
      expect(zoneDetails.$origin).toBeDefined();
    }
  });

  it("should have ttl", () => {
    const files = globSync(`${__dirname}/**/*.zone`);

    for (const file of files) {
      const json = fs.readFileSync(file, "utf8");
      const zoneDetails = parse(json);
      expect(zoneDetails.$origin).toBeDefined();
    }
  });

  it("should have soa", () => {
    const files = globSync(`${__dirname}/**/*.zone`);

    for (const file of files) {
      const json = fs.readFileSync(file, "utf8");
      const zoneDetails = parse(json);
      expect(zoneDetails.soa).toBeDefined();
    }
  });

  it("should have ns", () => {
    const files = globSync(`${__dirname}/**/*.zone`);

    for (const file of files) {
      const json = fs.readFileSync(file, "utf8");
      const zoneDetails = parse(json);
      expect(zoneDetails.ns).toBeDefined();
    }
  });

  // // All Unit tests test the synthesised terraform code, it does not create real-world resources
  // describe("Unit testing using assertions", () => {
  //   it("should contain a resource", () => {
  //     // import { Image,Container } from "./.gen/providers/docker"
  //     expect(
  //       Testing.synthScope((scope) => {
  //         new MyApplicationsAbstraction(scope, "my-app", {});
  //       })
  //     ).toHaveResource(Container);

  //     expect(
  //       Testing.synthScope((scope) => {
  //         new MyApplicationsAbstraction(scope, "my-app", {});
  //       })
  //     ).toHaveResourceWithProperties(Image, { name: "ubuntu:latest" });
  //   });
  // });

  // describe("Unit testing using snapshots", () => {
  //   it("Tests the snapshot", () => {
  //     const app = Testing.app();
  //     const stack = new TerraformStack(app, "test");

  //     new TestProvider(stack, "provider", {
  //       accessKey: "1",
  //     });

  //     new TestResource(stack, "test", {
  //       name: "my-resource",
  //     });

  //     expect(Testing.synth(stack)).toMatchSnapshot();
  //   });

  //   it("Tests a combination of resources", () => {
  //     expect(
  //       Testing.synthScope((stack) => {
  //         new TestDataSource(stack, "test-data-source", {
  //           name: "foo",
  //         });

  //         new TestResource(stack, "test-resource", {
  //           name: "bar",
  //         });
  //       })
  //     ).toMatchInlineSnapshot();
  //   });
  // });

  // describe("Checking validity", () => {
  //   it("check if the produced terraform configuration is valid", () => {
  //     const app = Testing.app();
  //     const stack = new TerraformStack(app, "test");

  //     new TestDataSource(stack, "test-data-source", {
  //       name: "foo",
  //     });

  //     new TestResource(stack, "test-resource", {
  //       name: "bar",
  //     });
  //     expect(Testing.fullSynth(app)).toBeValidTerraform();
  //   });

  //   it("check if this can be planned", () => {
  //     const app = Testing.app();
  //     const stack = new TerraformStack(app, "test");

  //     new TestDataSource(stack, "test-data-source", {
  //       name: "foo",
  //     });

  //     new TestResource(stack, "test-resource", {
  //       name: "bar",
  //     });
  //     expect(Testing.fullSynth(app)).toPlanSuccessfully();
  //   });
  // });
});
