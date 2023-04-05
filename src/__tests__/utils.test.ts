import {expect, it} from "@jest/globals";
import {truncateAptSuffix} from "../utils";

it("truncate apt suffix from ANS name correctly", () => {
  expect(truncateAptSuffix("name.")).toEqual("name");
  expect(truncateAptSuffix("name.a")).toEqual("name");
  expect(truncateAptSuffix("name.ap")).toEqual("name");
  expect(truncateAptSuffix("name.apt")).toEqual("name");
  expect(truncateAptSuffix("na1m-e.a")).toEqual("na1m-e");
  expect(truncateAptSuffix("nam-e1.ap")).toEqual("nam-e1");
});
