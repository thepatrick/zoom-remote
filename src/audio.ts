import axios from 'axios';

const companion = process.env.COMPANION;
if (companion === undefined) {
  throw new Error('COMPANION not set');
}

const pushButton = async (page: number, bank: number): Promise<{ data: string }> =>
  axios.get<string>(`http://${companion}/press/bank/${page}/${bank}`);

export const audio = {
  mic: {
    async mute(): Promise<void> {
      await pushButton(6, 18);
    },
    async unmute(): Promise<void> {
      await pushButton(6, 17);
    },
  },
  headphones: {
    async mute(): Promise<void> {
      await pushButton(6, 10);
    },
    async unmute(): Promise<void> {
      await pushButton(6, 9);
    },
    async switchTo(): Promise<void> {
      await pushButton(6, 11);
    },
  },
  deskspeakers: {
    async mute(): Promise<void> {
      await pushButton(6, 2);
    },
    async unmute(): Promise<void> {
      await pushButton(6, 1);
    },
    async switchTo(): Promise<void> {
      await pushButton(6, 3);
    },
  },
};
