import jadnTests from './jadn';
import codecTests from './codec';


function run() {
  describe('Codec Tests', () => {
    codecTests();
  });

  describe('JADN Tests', () => {
    jadnTests();
  });
}

export default run;