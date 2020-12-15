import {
  isInIcestark,
  getMountNode,
} from '@ice/stark-app';

export function modifyClientRenderOpts(oldOpts) {
  if (isInIcestark()) {
    oldOpts.rootElement = getMountNode();
  }
  return oldOpts;
}
