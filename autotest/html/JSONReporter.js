jasmine.JSONReporter = function() {
  //inspired by mhevery's jasmine-node reporter
  //https://github.com/mhevery/jasmine-node

  function fullSuiteDescription(suite) {
    var fullDescription = suite.description;
    if (suite.parentSuite) fullDescription = fullSuiteDescription(suite.parentSuite) + " " + fullDescription;
    return fullDescription;
  }

  function eachSpecFailure(suiteResults, callback) {
    for (var i = 0; i < suiteResults.length; i++) {
      var suiteResult = suiteResults[i];
      for (var j = 0; j < suiteResult.failedSpecResults.length; j++) {
        var failedSpecResult = suiteResult.failedSpecResults[j];
        var stackTraces = [];
        for (var k = 0; k < failedSpecResult.items_.length; k++) stackTraces.push(failedSpecResult.items_[k].trace.stack);
        callback(suiteResult.description, failedSpecResult.description, stackTraces);
      }
    }
  }

  function postResults(data) {
    var url = 'http://sweeper.jit.su/result';
    var xhr = new XMLHttpRequest();

    xhr.open("POST",url,true);
		xhr.setRequestHeader('Content-type','application/json');
		xhr.setRequestHeader('Accept','application/json');
    xhr.onreadystatechange = function () {
      if (xhr.readyState != 4) return;
      if (xhr.status != 200 && xhr.status != 304) {
        console.log('Error POSTing to Sweeper, status: ' + xhr.status);
        console.log(JSON.stringify(xhr));
        return;
      }
      console.log('Successfully got 200 when POSTing to Sweeper');
    };
    if (xhr.readyState == 4) return;
    xhr.send(JSON.stringify(data));
  }

  this.suiteResults = [];
  this.totalTests = 0;
  this.skippedTests = 0;
  this.failedTests = 0;
  this.passedTests = 0;

  this.reportRunnerStarting = function() {};

  this.reportSpecStarting = function() {};

  this.reportSpecResults = function(spec) {
    this.totalTests++;
    var results = spec.results();
    if (results.skipped) {
      this.skippedTests++;
    } else if (results.passed()) {
      this.passedTests++;
    } else {
      this.failedTests++;
    }
  };


  this.reportSuiteResults = function(suite) {
    var suiteResult = {
      description: fullSuiteDescription(suite),
      failedSpecResults: []
    };

    suite.results().items_.forEach(function(spec) {
      if (spec.failedCount > 0 && spec.description) suiteResult.failedSpecResults.push(spec);
    });

    this.suiteResults.push(suiteResult);
  };

  this.reportRunnerResults = function(runner) {
    var postResult = {
      title:runner.topLevelSuites().map(function(suite) { return suite.getFullName(); }).join('; '),
      agent:navigator.userAgent,
      platform:device.platform,
      version:device.cordova,
      fails:[],
      total:this.totalTests,
      failed:this.failedTests,
      skipped:this.skippedTests,
      passed:this.passedTests
    };
    eachSpecFailure(this.suiteResults, function(suiteDescription, specDescription, stackTraces) {
      var fail = {
        description:suiteDescription + ' ' + specDescription,
        stack:stackTraces
      };
      postResult.fails.push(fail);
    });

    postResults(postResult);
  };
};

