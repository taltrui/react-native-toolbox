import Camera, { CameraType } from './Camera';
import FS, { FSType } from './FS';

interface ToolboxType {
  Camera: CameraType;
  FS: FSType;
}

const Toolbox = {
  Camera,
  FS,
};

export default Toolbox as ToolboxType;
