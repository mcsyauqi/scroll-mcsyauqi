// save the newest image tile -> args[0]
import { imageIds, save, mid } from './flowlib.mjs';
export default async ({ page, args }) => {
  const srcs = await imageIds(page);
  console.log('tiles', srcs.map(mid));
  console.log('saved', await save(srcs[0], args[0]));
};
