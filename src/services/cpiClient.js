const axios = require("axios");

const axiosInstance = (connect) => {
  
    let headerObject = {};
    // let timeout = 1000;
    if (!connect.headers) {
        console.log('\nNo headers provided')
       headerObject =  {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${connect.token}`
            }
    } 

    // if(connect.hasOwnProperty("timeout")) {
    //     console.log('\nTimeout property\n', connect.timeout);
    //     timeout = connect.timeout
    // }

    const config = {
      baseURL: connect.url,
      // timeout: timeout,
      headers: headerObject
    }

    if (connect.hasOwnProperty('responseType')) {
      // in case of response of 'arrayBuffer'
      console.log('responseType')
      config.responseType = connect.responseType;
    }

    console.log('CONFIG: ', {...config, headers: config.headers.Accept})
    const instance = axios.create(config);

      return instance;
}

  module.exports = {
    axiosInstance
  }