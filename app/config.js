// set mongodb location

module.exports = {

    mongolab:
    {
        name: "scotch-user-map-ec2",
        url: "mongodb://scotch:scotchrocks@ds051853.mongolab.com:51853/mean-map-app",
        port: 27017
    },

    local:
    {
        name: "codermap",
        url: "mongodb://localhost/codermap",
        port: 27017
    },

    localtest:
    {
        name: "codermaptest",
        url: "mongodb://localhost/codermaptest",
        port: 27017
    }

};