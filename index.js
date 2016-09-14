exports.printMsg = function() {
    logger.debug("This is a message from the demo package");
}
var mastersocket, url;
var staticlogopener = "SiebelSelenium::";
var logger;
var mobileapplication;
var webdriver, driver, By, until;
/* contains individual snippets and flow creator */
function siebelwait() {
    return driver.executeScript("return (SiebelApp.S_App.uiStatus.IsBusy())").then(function(retval) {
        if (retval === false || retval === "false") {
            logger.debug(new Date() + "::Completed");
            return true;
        }
        else {
            return false;
        }
    })
}

function okbutton() {
    return driver.executeScript("return ($(\"button[data-display='OK']\").length)").then(function(retval) {
        if (parseInt(retval) > 0) {
            logger.debug(new Date() + "::Completed");
            return true;
        }
        else {
            //logger.debug("waiting");
            return false;
        }
    })
}

function custom() {
    return driver.executeScript("return ($(\".searchContainer:visible\").length)").then(function(retval) {
        if (parseInt(retval) > 0) {
            logger.debug(new Date() + "::Completed");
            return true;
        }
        else {
            //logger.debug("waiting");
            return false;
        }
    })
}
var active_applet_controlnames = function() {
        logger.debug(arguments);
        //alert(applet);
        var callback = arguments[arguments.length - 1];
        logger.debug(arguments[0]);
        var controls = SiebelApp.S_App.GetActiveView().GetActiveApplet().GetControls();
        var retval = {};
        for (var a in controls) {
            logger.debug(a);
            if (controls[a].GetDisplayName() === arguments[0]) {
                retval[controls[a].GetDisplayName()] = controls[a].GetFieldName();
            }
        }
        callback(retval);
    }
    //Helper function which is executed through execasync for returning Display Field Name and corresponding BC Field Name
var fn = function() {
    console.log("SeleniumScript->Getting Control Names from UI Names");
    console.log(arguments[0], arguments[1]);
    var callback = arguments[arguments.length - 1];
    var controls = SiebelApp.S_App.GetActiveView().GetAppletMap()[arguments[0]].GetControls();
    var retval = {};
    for (var a in controls) {
        for (var k in arguments[1]) {
            //for (var j in arguments[1][k]){
            //console.log(controls[a].GetDisplayName(),k);
            if (controls[a].GetDisplayName() === k) {
                retval[controls[a].GetDisplayName()] = controls[a].GetFieldName();
            }
            //}
        }
    }
    callback(retval);
};
var executequery_setsearchspec = function() {
    var callback = arguments[arguments.length - 1];
    SiebelApp.S_App.GetActiveView().GetActiveApplet().InvokeMethod("NewQuery");
    var controls = SiebelApp.S_App.GetActiveView().GetAppletMap()[arguments[0]].GetControls();
    var retval = {};
    for (var a in controls) {
        for (var k in arguments[1]) {
            if (controls[a].GetDisplayName() === k) {
                retval[controls[a].GetDisplayName()] = controls[a].GetFieldName();
                SiebelApp.S_App.GetActiveView().GetActiveApplet().GetBusComp().GetFieldMap()[controls[a].GetFieldName()].SetSearchSpec(arguments[1][k]["value"]);
            }
        }
    }
    SiebelApp.S_App.GetActiveView().GetActiveApplet().InvokeMethod("ExecuteQuery");
    callback(retval);
};
var invokepop = function() {
    var callback = arguments[arguments.length - 1];
    logger.debug(arguments[0]);
    var q = {
        async: true,
        selfbusy: true
    };
    SiebelApp.S_App.GetActiveView().GetAppletMap()[arguments[0]].SetActiveControl(SiebelApp.S_App.GetActiveView().GetAppletMap()[arguments[0]].GetControls()[arguments[1]]);
    SiebelApp.S_App.GetActiveView().GetAppletMap()[arguments[0]].FieldPopup(q);
    callback(true);
};
//drilldown
function drilldown(applet, field) {
    try {
        var start = new Date();
        logger.debug("drilldown");
        var cb = arguments[arguments.length - 1];
        logger.debug(arguments);
        l_arguments = arguments;
        var returnedcontrols = {};
        driver.executeAsyncScript(fn, l_arguments[0].applet, arguments[0].field).then(function(str) {
            returnedcontrols = str;
            logger.debug(returnedcontrols);
            var drilldownstring = 'SiebelApp.S_App.GetActiveView().GetAppletMap()[\"' + l_arguments[0].applet + '\"].OnDrillDown(\"' + returnedcontrols[Object.keys(l_arguments[0].field)[0]] + '\",SiebelApp.S_App.GetActiveView().GetAppletMap()[\"' + l_arguments[0].applet + '\"].GetBusComp().GetSelection())';
            logger.debug(drilldownstring);
            driver.executeScript(drilldownstring).then(function() {
                logger.debug("executed drilldown");
                driver.wait(siebelwait).then(function() {
                    logger.debug(new Date() + "drilldown over");
                    dbupdatestatus(l_arguments[0].id, "Success", cb, start);
                });
            });
        }).catch(function(e) {
            errhandler(cb, e, l_arguments[0].id, start);
        });
    }
    catch (e) {
        logger.error(e);
        return (e);
    }
}
//newrecord(appletname, field, dependency, id, callback);
var newrecord = function newrecord() {
        logger.debug("newrecord");
        var start = new Date();
        var cbmain = arguments[1];
        var gbid = arguments[0].id;
        var dependency = dependency;
        var m_arguments = arguments;
        logger.debug(m_arguments);
        //logger.debug(arguments);
        try {
            var returnedcontrols = {};
            var currentindex = 0;
            //helper function called to start the serial async function calls to setfieldvalue post new record
            function setfield(field, returnedcontrols) {
                logger.info("NewRecord - SetField");
                logger.info(field);
                logger.info(returnedcontrols);
                var len = Object.keys(field).length;
                setfieldrecursive(returnedcontrols, field, Object.keys(field)[currentindex], currentindex);
            }
            //helper function called to do setfield value
            function setfieldrecursive(returnedcontrols, field, fieldarg, currentindex) {
                logger.debug("iteration-" + currentindex);
                logger.debug(arguments);
                if (field === undefined || field[fieldarg] === undefined) {
                    ++currentindex;
                }
                else if (field[fieldarg].type === "" || field[fieldarg].type === undefined) {
                    var setfieldvalue = 'SiebelApp.S_App.GetActiveView().GetActiveApplet().GetBusComp().SetFieldValue(\"' + returnedcontrols[fieldarg] + '\",\"' + field[fieldarg].value + '\")';
                    logger.debug(setfieldvalue);
                    driver.executeScript(setfieldvalue).then(function() {
                        driver.wait(siebelwait).then(function() {
                            logger.debug(new Date() + "executed setfieldvalue-" + returnedcontrols[fieldarg]);
                            ++currentindex;
                            if (currentindex >= Object.keys(field).length) {
                                logger.debug("loop over");
                            }
                            else {
                                setfieldrecursive(returnedcontrols, field, Object.keys(field)[currentindex], currentindex);
                            }
                        })
                    })
                }
                else {
                    logger.debug("popup - " + fieldarg + ":" + field[fieldarg].type);
                    driver.executeScript("SiebelApp.S_App.GetActiveView().GetAppletMap()[\"" + applet + "\"].GetView().SetActiveApplet(SiebelApp.S_App.GetActiveView().GetAppletMap()[\"" + applet + "\"])");
                    driver.executeScript("SiebelApp.S_App.GetActiveView().GetAppletMap()[\"" + applet + "\"].SetActiveControl(SiebelApp.S_App.GetActiveView().GetAppletMap()[\"" + applet + "\"].GetControls()[\"" + returnedcontrols[fieldarg] + "\"])");
                    var q = {
                        async: true,
                        selfbusy: true
                    };
                    //SiebelApp.S_App.GetActiveView().GetAppletMap()[arguments[0]].SetActiveControl(SiebelApp.S_App.GetActiveView().GetAppletMap()[arguments[0]].GetControls()[arguments[1]]);
                    driver.executeScript("SiebelApp.S_App.GetActiveView().GetAppletMap()[\"" + applet + "\"].FieldPopup()").then(function() {
                        //driver.executeAsyncScript(invokepop,applet,returnedcontrols[fieldarg]).then(function(){
                        logger.debug("Popup has been invoked");
                        driver.wait(okbutton).then(function() {
                            logger.debug(new Date() + "popupshown-" + returnedcontrols[fieldarg]);
                            //get the control names
                            driver.executeAsyncScript(active_applet_controlnames, field[fieldarg]["pickfield"]).then(function(str) {
                                driver.executeScript('SiebelApp.S_App.GetActiveView().GetActiveApplet().InvokeMethod("NewQuery")').then(function() {
                                    driver.wait(siebelwait).then(function() {
                                        logger.debug(new Date() + "got popup controls-");
                                        logger.debug(str);
                                        var popupsearchspec = 'SiebelApp.S_App.GetActiveView().GetActiveApplet().GetBusComp().GetFieldMap()[\"' + str[field[fieldarg].pickfield] + '\"].SetSearchSpec(\"' + field[fieldarg]["value"] + "\")";
                                        logger.debug(popupsearchspec);
                                        driver.executeScript(popupsearchspec).then(function() {
                                            driver.executeScript('SiebelApp.S_App.GetActiveView().GetActiveApplet().InvokeMethod("ExecuteQuery")').then(function() {
                                                driver.wait(siebelwait).then(function() {
                                                    logger.debug(new Date() + "executed searchspec");
                                                    driver.findElement(By.css("button[data-display='OK']")).click().then(function() {
                                                        ++currentindex;
                                                        if (currentindex >= Object.keys(field).length) {
                                                            logger.debug("loop over");
                                                        }
                                                        else {
                                                            setfieldrecursive(returnedcontrols, field, Object.keys(field)[currentindex], currentindex);
                                                        }
                                                    });
                                                });
                                            });
                                        });
                                    });
                                });
                            });
                        });
                    })
                }
            }
            //Start NewRecord
            //logger.debug("field", field);
            logger.debug("Starting New Record");
            driver.executeAsyncScript(fn, m_arguments[0].applet, m_arguments[0].field).then(function(str) {
                //logger.debug(str);
                returnedcontrols = str;
                driver.wait(siebelwait).then(function() {
                    logger.debug(new Date() + "got the control names");
                    logger.debug(returnedcontrols);
                    //invoke newrecord
                    driver.executeScript("SiebelApp.S_App.GetActiveView().GetAppletMap()[\"" + m_arguments[0].applet + "\"].InvokeMethod(\"NewRecord\")");
                    driver.wait(siebelwait).then(function() {
                        logger.debug(new Date() + "executed new record");
                        mastersocket.emit('news', {
                            'msg': 'executed new record'
                        })
                        logger.debug("starting  setfield");
                        setfield(m_arguments[0].field, returnedcontrols);
                        logger.debug("starting  function call - writerecord");
                        //writerecord
                        driver.executeScript("SiebelApp.S_App.GetActiveView().GetAppletMap()[\"" + m_arguments[0].applet + "\"].InvokeMethod(\"WriteRecord\")").then(function() {
                            driver.wait(siebelwait).then(function() {
                                logger.debug(new Date() + "executed write record");
                                //return recordid
                                driver.executeScript("return SiebelApp.S_App.GetActiveView().GetActiveApplet().GetBusComp().GetFieldValue('Id')").then(function(rowid) {
                                    logger.debug("id:" + rowid);
                                    return dbupdatestatus(gbid, "Success", cbmain, start, "NewRecord Id:" + rowid);
                                });
                            });
                        })
                    })
                })
            }).catch(function(e) {
                //logger.debug("error in newrecord");
                //logger.info(e.name);
                //logger.info(e.message);
                //logger.error(e);
                return errhandler(cbmain, e, gbid, start);
            });
        }
        catch (e) {
            logger.error(e);
            return errhandler(cbmain, e, gbid, start);
        }
    }
    //updaterecord(appletname, searchspec,field, queryfield,dependency, id, callback);
function updaterecord(appletname, searchspec, field, queryfield, dependency, id, callback) {
    logger.debug("updaterecord");
    var start = new Date();
    var dependency = dependency;
    logger.debug(arguments);
    try {
        var returnedcontrols = {};
        var currentindex_u = 0;
        //helper function called to start the serial async function calls to setfieldvalue post new record
        function setfield_u(field) {
            logger.debug("Starting Iteration over fields to be set - ", field);
            var len = Object.keys(field).length;
            logger.debug("Total calls - ");
            cb_u(Object.keys(field)[currentindex_u], currentindex_u);
        }
        //helper function called to do setfield value
        function cb_u(fieldarg, currentindex) {
            logger.debug("recursive call iteration - ", fieldarg, currentindex);
            if (fieldarg === undefined) {
                logger.debug("doing nothing");
                ++currentindex_u;
                if (currentindex_u >= Object.keys(field).length) {
                    logger.debug("loop over");
                }
            }
            else if (field[fieldarg].type === "" || field[fieldarg].type === undefined) {
                var setfieldvalue = 'SiebelApp.S_App.GetActiveView().GetActiveApplet().GetBusComp().SetFieldValue(\"' + returnedcontrols[fieldarg] + '\",\"' + field[fieldarg].value + '\")';
                logger.debug(setfieldvalue);
                driver.executeScript(setfieldvalue).then(function() {
                    driver.wait(siebelwait).then(function() {
                        logger.debug(new Date() + "executed setfieldvalue-" + returnedcontrols[fieldarg]);
                        ++currentindex_u;
                        if (currentindex_u >= Object.keys(field).length) {
                            logger.debug("loop over");
                        }
                        else {
                            cb_u(Object.keys(field)[currentindex_u], currentindex_u);
                        }
                    }).catch(function(e) {
                        errhandler(callback, e, id, start);
                    });
                });
            }
            else if (field[fieldarg].type !== "" && field[fieldarg].type !== undefined) {
                logger.debug("popup - " + fieldarg + ":" + field[fieldarg].type);
                driver.executeScript("SiebelApp.S_App.GetActiveView().GetAppletMap()[\"" + applet + "\"].GetView().SetActiveApplet(SiebelApp.S_App.GetActiveView().GetAppletMap()[\"" + applet + "\"])");
                driver.executeScript("SiebelApp.S_App.GetActiveView().GetAppletMap()[\"" + applet + "\"].SetActiveControl(SiebelApp.S_App.GetActiveView().GetAppletMap()[\"" + applet + "\"].GetControls()[\"" + returnedcontrols[fieldarg] + "\"])");
                var q = {
                    async: true,
                    selfbusy: true
                };
                //SiebelApp.S_App.GetActiveView().GetAppletMap()[arguments[0]].SetActiveControl(SiebelApp.S_App.GetActiveView().GetAppletMap()[arguments[0]].GetControls()[arguments[1]]);
                driver.executeScript("SiebelApp.S_App.GetActiveView().GetAppletMap()[\"" + applet + "\"].FieldPopup()").then(function() {
                    //driver.executeAsyncScript(invokepop,applet,returnedcontrols[fieldarg]).then(function(){
                    logger.debug("Popup has been invoked");
                    driver.wait(okbutton).then(function() {
                        logger.debug(new Date() + "popupshown-" + returnedcontrols[fieldarg]);
                        //get the control names
                        driver.executeAsyncScript(active_applet_controlnames, field[fieldarg]["pickfield"]).then(function(str) {
                            driver.executeScript('SiebelApp.S_App.GetActiveView().GetActiveApplet().InvokeMethod("NewQuery")').then(function() {
                                driver.wait(siebelwait).then(function() {
                                    logger.debug(new Date() + "got popup controls-");
                                    logger.debug(str);
                                    var popupsearchspec = 'SiebelApp.S_App.GetActiveView().GetActiveApplet().GetBusComp().GetFieldMap()[\"' + str[field[fieldarg].pickfield] + '\"].SetSearchSpec(\"' + field[fieldarg]["value"] + "\")";
                                    logger.debug(popupsearchspec);
                                    driver.executeScript(popupsearchspec).then(function() {
                                        driver.executeScript('SiebelApp.S_App.GetActiveView().GetActiveApplet().InvokeMethod("ExecuteQuery")').then(function() {
                                            driver.wait(siebelwait).then(function() {
                                                logger.debug(new Date() + "executed searchspec");
                                                driver.findElement(By.css("button[data-display='OK']")).click().then(function() {
                                                    ++currentindex_u;
                                                    if (currentindex_u >= Object.keys(field).length) {
                                                        logger.debug("loop over");
                                                    }
                                                    else {
                                                        cb_u(Object.keys(field)[currentindex_u], currentindex_u);
                                                    }
                                                });
                                            });
                                        });
                                    });
                                });
                            });
                        });
                    });
                }).catch(function(e) {
                    errhandler(callback, e, id, start);
                });
            }
            else {
                logger.debug("really nothing else left to do");
            }
        }
        //Start UpdateRecord
        //Query
        driver.executeAsyncScript(executequery_setsearchspec, appletname, queryfield).then(function(str) {
            logger.debug(str);
            driver.executeAsyncScript(fn, appletname, field).then(function(str) {
                logger.debug(str);
                returnedcontrols = str;
                driver.wait(siebelwait).then(function() {
                    logger.debug(new Date() + "got the control names");
                    setfield_u(field);
                    //writerecord
                    driver.executeScript("SiebelApp.S_App.GetActiveView().GetAppletMap()[\"" + appletname + "\"].InvokeMethod(\"WriteRecord\")").then(function() {
                        driver.wait(siebelwait).then(function() {
                            logger.debug(new Date() + "executed write record");
                            //return recordid
                            driver.executeScript("return SiebelApp.S_App.GetActiveView().GetActiveApplet().GetBusComp().GetFieldValue('Id')").then(function(rowid) {
                                logger.debug("id:" + rowid);
                                //cbmain(null, id);
                                dbupdatestatus(id, "Success", callback, start, "UpdatedRecord Id : " + rowid);
                            });
                        });
                    }).catch(function(e) {
                        errhandler(callback, e, id, start);
                    });
                });
            })
        }).catch(function(e) {
            errhandler(callback, e, id, start);
        });
    }
    catch (e) {
        logger.debug(e);
        errhandler(callback, e, id, start);
        throw (e);
    }
}
//Helper function which starts adb for mobile testing
function startadb() {
    const exec = require('child_process').exec;
    var exe = 'adb.exe start-server'
    exec(exe, (err, stdout, stderr) => {
        if (err) {
            console.error(err);
            return;
        }
        logger.debug(stdout);
    });
}
var setup = function start() {
        try {
            logger.debug(arguments);
            url = arguments[0].url;
            logger.debug("start");
            logger.info("MobileApplication - " + arguments[0].mobileapplication);
            var start = new Date();
            webdriver = require('selenium-webdriver'),
                By = webdriver.By,
                until = webdriver.until,
                chrome = require('selenium-webdriver/chrome');
            if (mobileapplication === "Y") {
                logger.debug("starting mobile application");
                driver = new webdriver.Builder().forBrowser('chrome').setChromeOptions(new chrome.Options().androidChrome()).build();
                startadb();
                return dbupdatestatus(arguments[0].id, "Success", arguments[arguments.length - 1], start, "Driver Initialized");
            }
            else {
                driver = new webdriver.Builder().forBrowser('chrome').build()
				/*.then(function() {
                    driver.wait(siebelwait).then(function() {
                        return dbupdatestatus(arguments[0].id, "Success", cb, start, "Driver Initialized");
                    })
                }).catch(function(e) {
                    return errhandler(arguments[1], e, l_arguments[0].id, start);
                });*/
                return dbupdatestatus(arguments[0].id, "Success", arguments[arguments.length - 1], start, "Driver Initialized");
            }
            //return driver;
        }
        catch (e) {
			logger.info("setup catch");
            logger.error(e);
            return errhandler(callback, e, id, start);
        }
    }
    //login(driver, url, uid, pwd, sso, uidfldname, pwdfldname, loginbutton, ssouid, ssopwd, ssologin, homepage, dependency, id, callback)
    //arguments start from index 0
var login = function login() {
        //function login() {
        try {
            //driver = arguments[0];
            logger.debug(arguments);
            l_arguments = arguments;
            logger.debug(arguments);
            logger.debug("login start");
            var start = new Date();
            var dependency = arguments[0].dependency; //arguments[arguments.length - 2];
            if (arguments[0].sso == "Y") {
                //THIS IS AN SSO Login
                driver.get(url).then(function() {
                    driver.findElement(By.name('username')).sendKeys(l_arguments[0].uid).then(function() {
                        driver.findElement(By.name('password')).sendKeys(l_arguments[0].pwd).then(function() {
                            driver.findElement(By.className(l_arguments[0].ssologin)).click().then(function() {
                                driver.wait(siebelwait).then(function() {
                                    return dbupdatestatus(l_arguments[0].id, "Success", l_arguments[1], start, "Login Complete");
                                })
                            })
                        })
                    }).catch(function(e) {
						logger.error(e);
						var f = new Error("Please check connectivity to siebel application from browser");
						return errhandler(l_arguments[1],f , l_arguments[0].id, start);
					})					
                }).catch(function(e) {
                    return errhandler(l_arguments[1], e, l_arguments[0].id, start);
                })
            }
            else {
                var uid = arguments[0].uid;
                driver.get(url).then(function() {
                    driver.findElement(By.name('SWEUserName')).sendKeys(l_arguments[0].uid).then(function() {
                        driver.findElement(By.name('SWEPassword')).sendKeys(l_arguments[0].pwd).then(function() {
                            if (mobileapplication === "Y") {
                                driver.findElement(By.css('.siebui-mb-loginButton>a')).click().then(function() {
                                    driver.wait(siebelwait).then(function() {
                                        //update database and call back post successful update
                                        return dbupdatestatus(l_arguments[0].id, "Success", l_arguments[1], start, "Login Complete");
                                    })
                                })
                            }
                            else {
                                driver.findElement(By.css('p.loginButton>a')).click().then(function() {
                                    driver.wait(siebelwait).then(function() {
                                        //update database and call back post successful update
                                        return dbupdatestatus(l_arguments[0].id, "Success", l_arguments[1], start, "Login Complete");
                                    })
                                })
                            }
                        })
                    }).catch(function(e) {
						logger.error(e);
						var f = new Error("Please check connectivity to siebel application from browser");
						return errhandler(l_arguments[1],f , l_arguments[0].id, start);
					})	
                }).catch(function(e) {
                    logger.error("catch login selenium-webdriver");
                    logger.error(e);
                    return errhandler(l_arguments[1], e, l_arguments[0].id, start);
                })
            }
        }
        catch (e) {
            logger.error("catch login");
			logger.error(e);
            return errhandler(l_arguments[1], e, l_arguments[0].id, start);
        }
    }
    //gotoview(view, applet1, applet2, rowid1, rowid2, displayname, dependency, id, callback);
var gotoview = function gotoview() {
    try {
        logger.debug("gotoview");
        logger.debug(arguments);
        l_arguments = arguments;
        var start = new Date();
        var cb = l_arguments[1];
        //var vw = (view).replace(/ /g, "+");
        //setTimeout(timeout, 5000);
        var stillwaiting = true;
        /*function timeout() {
            if (stillwaiting === true) {
                errhandler(cb, "Timeout", id, start);
            }
        }*/
        /*driver.get(url + "?SWECmd=GotoView&SWEView=" + vw).then(function() {
            driver.wait(siebelwait).then(function() {
                logger.debug(new Date());
                driver.wait(custom).then(function() {
                    stillwaiting = false;
                    logger.debug("custom:" + new Date());
                    dbupdatestatus(arguments[0].id, "Success", cb, start, "GotoView Complete");
                    //cb(null, "gotoview");
                });
            });
        }).catch(function(e) {
            errhandler(cb, e, arguments[0].id, start);
        });*/
        logger.info(l_arguments[0].view);
        driver.executeScript("SiebelApp.S_App.GotoView('" + l_arguments[0].view + "')").then(function() {
            driver.wait(custom).then(function() {
                logger.debug(new Date());
                return dbupdatestatus(arguments[0].id, "Success", cb, start, "GotoView Complete");
            })
        }).catch(function(e) {
            return errhandler(cb, e, l_arguments[0].id, start);
        });
    }
    catch (e) {
        return errhandler(cb, e, l_arguments[0].id, start);
    }
}
var exit = function exit(errmsg) {
    logger.debug("exit");
    logger.debug(errmsg);
    if (errmsg !== null && errmsg !== undefined) {
        if (errmsg.indexOf("reachable") < 0) {
            driver.quit();
            mastersocket.emit('news', {
                'msg': 'Closing Browser'
            });
        }
    }
    else {
        driver.quit();
        mastersocket.emit('news', {
            'msg': 'Closing Browser'
        });
    }
}
var keyboardaccelerator = function() {
    var start = new Date();
    var l_arguments = arguments;
    logger.debug("sitemap");
    var acs = new webdriver.ActionSequence(driver);
    acs.keyDown(webdriver.Key.CONTROL).keyDown(webdriver.Key.SHIFT).sendKeys("a").perform().then(function() {
        driver.wait(siebelwait).then(function() {
            return dbupdatestatus(arguments[0].id, "Success", cb, start, "GotoView Complete");
        })
    }).catch(function(e) {
        return errhandler(arguments[1], e, l_arguments[0].id, start);
    });
}
var sitemap = function() {
    var start = new Date();
    var l_arguments = arguments;
    logger.debug("sitemap");
    var acs = new webdriver.ActionSequence(driver);
    acs.keyDown(webdriver.Key.CONTROL).keyDown(webdriver.Key.SHIFT).sendKeys("a").perform().then(function() {
        driver.wait(siebelwait).then(function() {
            return dbupdatestatus(arguments[0].id, "Success", cb, start, "GotoView Complete");
        })
    }).catch(function(e) {
        return errhandler(arguments[1], e, l_arguments[0].id, start);
    });
}

function errhandler(cb, e, id, start) {
    try {
        if (e.name === "UnexpectedAlertOpenError") {
            //console.log("here1");
            var alert = driver.switchTo().alert();
            //console.log("here2");
            alert.getText().then(function(txt) {
                //console.log("got - " + txt);
                alert.accept();
                //console.log("here3");				
            });
        }
    }
    catch (e) {
        //console.log("here4");
        logger.error(e);
    }
    try {
        return dbupdatestatus(id, "Error", cb, start, e.message);
        //if (e.message.indexOf("reachable") < 0) driver.quit();
    }
    catch (e) {
        logger.info("dbdupdatestatus catch block;")
        logger.error(e);
    }
    //throw (e);
}

function dbupdatestatus(id, status, cb, start, msg) {
    try {
        //logger.debug("dbdupdatestatus", id, status, baseurl, JSON.stringify({
        //    "Status": status
        //}));
        /* commenting below code as shifting to pouchdb, pouchdb will take care of sync to main db
	var requestget = require('request');
    var requestput = require('request');
    var rev;
    var optionsget = {
        method: "GET",
        url: baseurl + "/" + id
    };
    requestget(optionsget, function (error, response, body) {
        //logger.debug(body);
        if (error === null || error === undefined) {
            rev = JSON.parse(body);
            rev["Status"] = status;
			
			rev["Execution Time"]= (end-start)/1000; 
            //logger.debug(rev);
            var optionsput = {
                method: "PUT",
                url: baseurl + "/" + id,
                body: JSON.stringify(rev)
            };
            requestput(optionsput, function (error, response, body) {
                //logger.debug(error, body);
                maincallback(cb,status, start, msg);
            });
        }
    });*/
        var end = new Date();
        return maincallback(cb, status, start, msg, end, id);
    }
    catch (e) {
        logger.info("dbdupdatestatus catch block;")
        logger.error(e);
    }
}
// Helper function that indicates the main asynch loop to start processing next request
var maincallback = function(callback, status, start, msg, end, id) {
    //logger.debug(mastersocket);
    try {
        mastersocket.emit('news', {
            'msg': msg
        });
        if (status !== "Success") {
            return callback(msg, {
                'msg': msg,
                'start': start,
                'end': end,
                'id': id,
                'status': status
            });
        }
        else {
            return callback(null, {
                'msg': msg,
                'start': start,
                'end': end,
                'id': id,
                'status': status
            });
        }
    }
    catch (e) {
        logger.info("maincallback catch block");
        logger.error(e);
        return (e);
    }
};
//newrecord(appletname, field, dependency, id, callback)
function newrecord_beta(applet, field, dependency, id, callback) {
    var a_new = require("async");
    logger.debug("newrecord");
    var start = new Date();
    var cbmain = callback;
    var gbid = id;
    var dependency = dependency;
    var m_arguments = arguments;
    logger.debug(arguments);
    try {
        var returnedcontrols = {};
        var currentindex = 0;
        //helper function called to do setfield value
        //Start NewRecord		
        driver.executeAsyncScript(fn, applet, field).then(function(str) {
            logger.debug(str);
            returnedcontrols = str;
            driver.wait(siebelwait).then(function() {
                logger.debug(new Date() + "got the control names");
                //invoke newrecord
                driver.executeScript("SiebelApp.S_App.GetActiveView().GetAppletMap()[\"" + applet + "\"].InvokeMethod(\"NewRecord\")");
                driver.wait(siebelwait).then(function() {
                    logger.debug(new Date() + "executed new record");
                    //setfield(field);
                    var a_new_obj = [];
                    //can add sorting here if this works
                    var z = function(f, k, c) {
                        cb_new(f, k, c);
                    }
                    for (var key in field) {
                        logger.debug(key);
                        //a_new_obj[key] = z;
                        //a_new_obj[key] = a_new.apply(z,field);
                        //a_new_obj[key] = a_new.apply(z,key);
                        var f1 = field;
                        var k1 = key;
                        a_new_obj.push(function(cz) {
                            cb_new(f1, k1, cz);
                        });
                    }
                    logger.debug(a_new_obj);
                    a_new.series(a_new_obj, function(error, results) {
                        logger.debug(error, results);
                    });
                });
            });
        }).catch(function(e) {
            errhandler(cbmain, e, gbid, start);
        });
        //writerecord
        driver.executeScript("SiebelApp.S_App.GetActiveView().GetAppletMap()[\"" + applet + "\"].InvokeMethod(\"WriteRecord\")").then(function() {
            driver.wait(siebelwait).then(function() {
                logger.debug(new Date() + "executed write record");
                //return recordid
                driver.executeScript("return SiebelApp.S_App.GetActiveView().GetActiveApplet().GetBusComp().GetFieldValue('Id')").then(function(rowid) {
                    logger.debug("id:" + rowid);
                    //cbmain(null, id);
                    dbupdatestatus(gbid, "Success", cbmain, start, rowid);
                });
            });
        }).catch(function(e) {
            errhandler(cbmain, e, gbid, start);
        });
    }
    catch (e) {
        logger.debug(e);
        errhandler(cbmain, e, gbid, start);
        throw (e);
    }
}

function cb_new(field, fieldarg, c) {
    logger.debug("iteration", field, fieldarg);
    if (field[fieldarg].type === "" || field[fieldarg].type === undefined) {
        var setfieldvalue = 'SiebelApp.S_App.GetActiveView().GetActiveApplet().GetBusComp().SetFieldValue(\"' + returnedcontrols[fieldarg] + '\",\"' + field[fieldarg].value + '\")';
        logger.debug(setfieldvalue);
        driver.executeScript(setfieldvalue).then(function() {
            driver.wait(siebelwait).then(function() {
                logger.debug(new Date() + "executed setfieldvalue-" + returnedcontrols[fieldarg]);
                c(null, "ok");
            }).catch(function(e) {
                c(e, e.message);
            });
        });
    }
    else {
        logger.debug("popup - " + fieldarg + ":" + field[fieldarg].type);
        driver.executeScript("SiebelApp.S_App.GetActiveView().GetAppletMap()[\"" + applet + "\"].GetView().SetActiveApplet(SiebelApp.S_App.GetActiveView().GetAppletMap()[\"" + applet + "\"])");
        driver.executeScript("SiebelApp.S_App.GetActiveView().GetAppletMap()[\"" + applet + "\"].SetActiveControl(SiebelApp.S_App.GetActiveView().GetAppletMap()[\"" + applet + "\"].GetControls()[\"" + returnedcontrols[fieldarg] + "\"])");
        var q = {
            async: true,
            selfbusy: true
        };
        //SiebelApp.S_App.GetActiveView().GetAppletMap()[arguments[0]].SetActiveControl(SiebelApp.S_App.GetActiveView().GetAppletMap()[arguments[0]].GetControls()[arguments[1]]);
        driver.executeScript("SiebelApp.S_App.GetActiveView().GetAppletMap()[\"" + applet + "\"].FieldPopup()").then(function() {
            //driver.executeAsyncScript(invokepop,applet,returnedcontrols[fieldarg]).then(function(){
            logger.debug("Popup has been invoked");
            driver.wait(okbutton).then(function() {
                logger.debug(new Date() + "popupshown-" + returnedcontrols[fieldarg]);
                //get the control names
                driver.executeAsyncScript(active_applet_controlnames, field[fieldarg]["pickfield"]).then(function(str) {
                    driver.executeScript('SiebelApp.S_App.GetActiveView().GetActiveApplet().InvokeMethod("NewQuery")').then(function() {
                        driver.wait(siebelwait).then(function() {
                            logger.debug(new Date() + "got popup controls-");
                            logger.debug(str);
                            var popupsearchspec = 'SiebelApp.S_App.GetActiveView().GetActiveApplet().GetBusComp().GetFieldMap()[\"' + str[field[fieldarg].pickfield] + '\"].SetSearchSpec(\"' + field[fieldarg]["value"] + "\")";
                            logger.debug(popupsearchspec);
                            driver.executeScript(popupsearchspec).then(function() {
                                driver.executeScript('SiebelApp.S_App.GetActiveView().GetActiveApplet().InvokeMethod("ExecuteQuery")').then(function() {
                                    driver.wait(siebelwait).then(function() {
                                        logger.debug(new Date() + "executed searchspec");
                                        driver.findElement(By.css("button[data-display='OK']")).click().then(function() {
                                            logger.debug("over with popup click");
                                            c(null, "ok");
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            });
        }).catch(function(e) {
            c(e, e.message);
        });
    }
}
var selector = function() {
        logger.debug(arguments);
        var retval = {};
        var fnd = true;
        //alert(applet);
        var callback = arguments[arguments.length - 1];
        var appletname = arguments[0];
        var appletdiv = SiebelApp.S_App.GetActiveView().GetAppletMap()[appletname].GetFullId();
        for (var k in arguments[1]) {
            logger.debug(k);
            logger.debug(arguments[1][k]["value"]);
            switch (k) {
                case "button":
                    var tofind = arguments[1][k]["value"];
                    $("div#" + appletdiv + " button").filter(function() {
                        logger.debug(tofind);
                        if ($(this).text() === tofind) {
                            retval[k] = "Found Button " + tofind;
                        }
                    });
                case "selector":
                    break;
            }
        }
        callback(retval);
    }
    //verifyhtml(appletname,  control,dependency, id, callback)
var verifyhtml = function verifyhtml(appletname, control, dependency, id, callback) {
        try {
            logger.debug("verifyhtml");
            var start = new Date();
            var cb = callback;
            driver.executeAsyncScript(selector, appletname, control).then(function(result) {
                logger.debug(result)
                driver.wait(siebelwait).then(function() {
                    dbupdatestatus(id, "Success", cb, start, "VerifyHTML Complete");
                });
            }).catch(function(e) {
                errhandler(cb, e, id, start);
            });
        }
        catch (e) {
            errhandler(cb, e, id, start);
        }
    }
    //customoperation(appletname,  control,dependency, id, callback)
function customoperation(appletname, value, dependency, id, callback) {
    try {
        logger.debug("customoperation");
        var start = new Date();
        var cb = callback;
        driver.executeAsyncScript(fndappletdiv, appletname).then(function(result) {
            driver.findElement(By.css("div#" + result + " " + value)).click().then(function(result) {
                logger.debug(result)
                driver.wait(siebelwait).then(function() {
                    dbupdatestatus(id, "Success", cb, start, "CustomOperation Complete");
                });
            })
        }).catch(function(e) {
            errhandler(cb, e, id, start);
        });
    }
    catch (e) {
        errhandler(cb, e, id, start);
    }
}
var fndappletdiv = function() {
    logger.debug(arguments);
    var retval = {};
    var fnd = true;
    //alert(applet);
    var callback = arguments[arguments.length - 1];
    var appletname = arguments[0];
    var appletdiv = SiebelApp.S_App.GetActiveView().GetAppletMap()[appletname].GetFullId();
    callback(appletdiv);
}
exports.login = login;
exports.exit = exit;
exports.setup = setup;
exports.newrecord = newrecord;
exports.updaterecord = updaterecord;
exports.drilldown = drilldown;
exports.verifyhtml = verifyhtml;
exports.gotoview = gotoview;
exports.sitemap = sitemap;
exports.deleterecord = deleterecord;
exports.keyboardaccelerator = keyboardaccelerator;
exports.setlogger = function(log) {
    logger = log;
    logger.debug("Logger Set");
}
exports.setmastersocket = function(sock) {
    mastersocket = sock;
    logger.debug("Socket set");
    //logger.debug(mastersocket);
}