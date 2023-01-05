import type { SendCommand } from "../../../src/request/sned-command";
import { parseSendCommand } from "../../../src/request/sned-command";

const sendCommand: SendCommand = {
  action: "send-command",
  battleID: "xxxxx",
  flowID: "xxxxx",
  command: {
    type: "BATTERY_COMMAND",
    battery: 3
  }
};

test("SendCommandなら正しくパースできる", () => {
  const result = parseSendCommand(sendCommand);
  expect(result).toEqual(sendCommand);
});

test("nullはパースできない", () => {
  const result = parseSendCommand(null);
  expect(result).toBe(null);
});

test("undefinedはパースできない", () => {
  const result = parseSendCommand(undefined);
  expect(result).toBe(null);
});