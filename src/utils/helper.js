export const sleep = (ms) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};

export const arrayRandomIndex = (length) => {
  return Math.floor(Math.random() * length);
}

export const randomIntFromInterval = (min, max) => { // min and max included 
  return Math.floor(Math.random() * (max - min + 1) + min);
}
