import { NativeModules } from 'react-native';

type ToolboxType = {
  multiply(a: number, b: number): Promise<number>;
};

const { Toolbox } = NativeModules;

export default Toolbox as ToolboxType;
