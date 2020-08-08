class mailgun {
  constructor(options) {
    const { apiKey, domain } = options;
  }

  messages() {
    return { send: () => {} };
  }
}
// const mailgun = ;
export default (options) => new mailgun(options);
