import { Test, TestingModule } from "@nestjs/testing";
import { WellKnownController } from "./well-known.controller";
import { Response } from "express";

describe("WellKnownController", () => {
  let controller: WellKnownController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WellKnownController],
    }).compile();

    controller = module.get<WellKnownController>(WellKnownController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("getAssetLinks", () => {
    it("should return asset links for Android", () => {
      const mockResponse = {
        json: jest.fn().mockReturnThis(),
      } as unknown as Response;

      controller.getAssetLinks(mockResponse);

      expect(mockResponse.json).toHaveBeenCalledWith([
        {
          relation: ["delegate_permission/common.handle_all_urls"],
          target: {
            namespace: "android_app",
            package_name: "com.pecae.app",
            sha256_cert_fingerprints: [
              "00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00",
            ],
          },
        },
      ]);
    });
  });

  describe("getAppleAppSiteAssociation", () => {
    it("should return apple app site association for iOS", () => {
      const mockResponse = {
        json: jest.fn().mockReturnThis(),
      } as unknown as Response;

      controller.getAppleAppSiteAssociation(mockResponse);

      expect(mockResponse.json).toHaveBeenCalledWith({
        applinks: {
          apps: [],
          details: [
            {
              appID: "YOUR_TEAM_ID.com.pecae.app",
              paths: ["*"],
            },
          ],
        },
      });
    });
  });
});
