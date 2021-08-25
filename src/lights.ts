import axios from 'axios';
import bonjour from 'bonjour';

type LightInfo = {
  numberOfLights: number;
  lights: {
    on: number;
    brightness: number;
    temperature: number;
  }[];
};

const getLightInfo = async (ip: string, port: number): Promise<{ data: LightInfo }> =>
  axios.get<LightInfo>(`http://${ip}:${port}/elgato/lights`);

const turnLightToPower = async (ip: string, port: number, power: 0 | 1): Promise<void> =>
  axios.put(`http://${ip}:${port}/elgato/lights`, { Lights: [{ On: power }] });

const setLightBrightness = async (ip: string, port: number, brightness: number): Promise<void> =>
  axios.put(`http://${ip}:${port}/elgato/lights`, { Lights: [{ Brightness: brightness }] });

const createLightService = () => {
  const bonj = bonjour();

  const lightsById: Record<string, { ip: string; port: number }> = {};

  const browser = bonj.find({ type: 'elg' });
  browser.on('up', (service) => {
    lightsById[service.txt.id] = {
      ip: service['referer'].address,
      port: service.port,
    };
    console.log({
      id: service.txt.id,
      ip: service['referer'].address,
      port: service.port,
    });
    // bonjour.destroy();
  });

  return {
    async power(id: string, state: 0 | 1 | undefined): Promise<void> {
      const light = lightsById[id];
      if (!light) {
        console.log('no light', id);
        return;
      }
      console.log('light!', id, light);
      if (state === undefined) {
        const { data: info } = await getLightInfo(light.ip, light.port);

        console.log('info', info);

        return turnLightToPower(light.ip, light.port, info.lights[0].on === 1 ? 0 : 1);
      }
      await turnLightToPower(light.ip, light.port, state);
    },
    async modifyBrightness(id: string, byAmount: number) {
      const light = lightsById[id];
      if (!light) {
        console.log('no light', id);
        return;
      }

      const { data: info } = await getLightInfo(light.ip, light.port);

      console.log('info', info);

      if (info.lights[0].on === 0) {
        console.log('light is off');
        return;
      }

      await setLightBrightness(light.ip, light.port, info.lights[0].brightness + byAmount);
    },
  };
};

const lightService = createLightService();

const LEFT_ID = '3C:6A:9D:16:21:EA';
const RIGHT_ID = '3C:6A:9D:16:21:E9';

export const lights = {
  power: {
    async on(): Promise<void> {
      await Promise.all([lights.left.power(1), lights.right.power(1)]);
    },
    async off(): Promise<void> {
      await Promise.all([lights.left.power(0), lights.right.power(0)]);
    },
  },
  left: {
    down(): Promise<void> {
      return lightService.modifyBrightness(LEFT_ID, -10);
    },
    power(state: 0 | 1 | undefined): Promise<void> {
      return lightService.power(LEFT_ID, state);
    },
    up(): Promise<void> {
      return lightService.modifyBrightness(LEFT_ID, 10);
    },
  },
  right: {
    down(): Promise<void> {
      return lightService.modifyBrightness(RIGHT_ID, -10);
    },
    power(state: 0 | 1 | undefined): Promise<void> {
      return lightService.power(RIGHT_ID, state);
    },
    up(): Promise<void> {
      return lightService.modifyBrightness(RIGHT_ID, 10);
    },
  },
};
