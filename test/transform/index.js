import commentTests from './comments';
import extentionTests from './extentions';

function run() {
  describe('Comment Tests', () => {
    commentTests();
  });

  describe('Extention Tests', () => {
    extentionTests();
  });
}

export default run;