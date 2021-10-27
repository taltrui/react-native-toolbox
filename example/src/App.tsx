import * as React from 'react';

import { StyleSheet, View } from 'react-native';
import Toolbox from 'react-native-toolbox';

export default function App() {
  React.useEffect(() => {
    Toolbox.FS.openImageLibrary(
      (assets) => console.log(assets),
      (err, errms) => console.log({ err, errms })
    );
  }, []);

  return <View style={styles.container} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  box: {
    width: 60,
    height: 60,
    marginVertical: 20,
  },
});
