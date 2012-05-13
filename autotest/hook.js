document.addEventListener('deviceready', function () {
  var jasmineEnv = jasmine.getEnv();
  jasmineEnv.updateInterval = 1000;

  var htmlReporter = new jasmine.HtmlReporter();

  jasmineEnv.addReporter(htmlReporter);

  var jsonReporter = new jasmine.JSONReporter();

  jasmineEnv.addReporter(jsonReporter);

  jasmineEnv.specFilter = function(spec) {
    return htmlReporter.specFilter(spec);
  };

  jasmineEnv.execute();
}, false);
