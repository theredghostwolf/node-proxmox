var querystring = require("querystring");
var exec = require('child_process').exec;
var events = require('events');
var eventEmitter = new events.EventEmitter();

module.exports = function(name, pwd, hostname) {

  var apiURL = 'https://' + hostname + ':8006/api2/json';
  var authString = 'username=' + name + '&password=' + pwd;

  var token = {};
    token.CSRF = '';
    token.PVEAuth = '';
    token.timeStamp = 0;

  function curlCom() {

    var command = '';

    this.get = function(url) {
	command = 'curl -k ';
        command += ('-b ' + 'PVEAuthCookie='+token.PVEAuth);
	command += (' ' + apiURL + url);
	return this;
    };
    this.post = function(url, data, header, cookie) {
	command = 'curl -X POST -k '
	if (typeof cookie === 'string') command += ('-b '+ 'PVEAuthCookie='+cookie + ' ');
	if (typeof header === 'string') command += ('-H ' +'"'+'CSRFPreventionToken:' + header + '"'+' ');
	command += ('-d '+'"'+data+'"'+' ');
	command += (apiURL + url);
	return this;
    };
    this.put = function(url, data, header, cookie) {
	command = 'curl -X PUT -k '
        command += ('-b ' + 'PVEAuthCookie='+ cookie + ' ');
	command += ('-H ' +'"'+'CSRFPreventionToken:' + header + '"'+' ');
	command += ('-d ' + '"' + data + '"' + ' ');
  command += (' ' + apiURL + url);
  console.log(command);
	return this;
    };
    this.del = function(url, data, header, cookie) {
  command = 'curl -X DELETE -k '
  if (typeof cookie === 'string') command += ('-b '+ 'PVEAuthCookie='+ cookie + ' ');
  if (typeof header === 'string') command += ('-H ' +'"'+'CSRFPreventionToken:' + header + '"'+' ');
  command += (' ' + apiURL + url);
  return this;
    };
    this.command = function() {
	return command;
    };
    return this;
  };

  function curl(command, callback) {
    exec(command, function(err, stdout, stderr) {
        var data = stdout;
        callback(err, data);
    });
  };

  function authorize(path, data, callback, cb) {
    command = curlCom().post('/access/ticket',authString).command();

    curl(command, function(err, response) {
	if (err) console.log(err);
	else {
	  response = JSON.parse(response);
	    token.CSRF = response.data.CSRFPreventionToken;
	    token.PVEAuth = response.data.ticket;
	    token.timeStamp = new Date().getTime();
	    if (typeof cb === 'function') cb(path, data, callback);
	}
    });
  };

  function makeRequest(method, path, data, callback){
    if (method == 'GET') {
      command = curlCom().get(path, data).command();
    }
    else if (method == 'POST') {
      command = curlCom().post(path, data, token.CSRF, token.PVEAuth).command();
    }
    else if (method == 'DEL') {
      command = curlCom().del(path, data, token.CSRF, token.PVEAuth).command();
    }
    else {
      command = curlCom().put(path, data, token.CSRF, token.PVEAuth).command();
    }

    curl(command, callback);
  };

  function get(path, data, callback) {
    if ( (token.timeStamp + 7200) < new Date().getTime() ) authorize(path, data, callback, get);
    else makeRequest('GET', path, data, callback);
  };

  function post(path, data, callback) {
    if ( (token.timeStamp + 7200) < new Date().getTime() ) authorize(path, data, callback, post);
    else {
	data = querystring.stringify(data);
	makeRequest('POST', path, data, callback);
    };
  };

  function del(path, data, callback) {
    if ( (token.timeStamp + 7200) < new Date().getTime() ) authorize(path, data, callback, del);
    else makeRequest('DEL', path, data, callback);
  };

  function put(path, data, callback) {
    if ( (token.timeStamp + 7200) < new Date().getTime() ) authorize(path, data, callback, put);
    else {
	data = querystring.stringify(data);
    	makeRequest('PUT', path, data, callback);
    }
  };

  return {
	  getClusterStatus: function(callback) {
		data = {};
         	get('/cluster/status', data, callback);
	   },
 	  getClusterBackupSchedule: function(callback) {
		data = {};
		get('/cluster/backup', data, callback);
	  },
	  getNodeNetworks: function(node,callback) {
		data = {};
		url = '/nodes/'+node+'/network';
		get(url, data, callback);
	  },
	  getNodeInterface: function(node, interface, callback) {
		data = {};
		url = '/nodes/'+node+'/network/'+interface;
		get(url, data, callback);
	  },
	  getNodeContainerIndex: function(node, callback) {
		data = {};
		url = '/nodes/'+node+'/openvz/';
		get(url, data, callback);
	  },
	  getNodeVirtualIndex: function(node, callback) {
		data = {};
		url = '/nodes/'+node+'/qemu';
		get(url, data, callback);
	  },
	  getNodeServiceState: function(node, service, callback) {
		data = {};
		url = '/nodes/'+node+'/services/'+service+'/state';
	    	get(url, data, callback);
	  },
	  getNodeStorage: function(node, callback) {
		data = {};
		url = '/nodes/'+node+'/storage';
	 	get(url, data, callback);
	  },
	  getNodeFinishedTasks: function(node, callback) {
		data = {};
		url = '/nodes/'+node+'/tasks';
		get(url, data, callback);
	  },
	  getNodeDNS: function(node, callback) {
		data = {};
		url = '/nodes/'+node+'/dns';
		get(url, data, callback);
	  },
	  getNodeSyslog: function(node, callback) {
		data = {};
		url = '/nodes/'+node+'/syslog';
		get(url, data, callback);
	  },
	  getNodeRRD: function(node, callback) {
		data = {};
		url = '/nodes/'+node+'/rrd';
		get(url, data, callback);
	  },
	  getNodeRRDData: function(node, callback) {
		data = {};
		url = '/nodes/'+node+'/rrddata';
		get(url, data, callback);
	  },
	  getNodeBeans: function(node, callback) {
		data = {};
		url = '/nodes/'+node+'/ubfailcnt';
		get(url, data, callback);
	  },
	  getNodeTaskByUPID: function(node, upid, callback) {
		data = {};
		url = '/nodes/'+node+'/tasks/'+upid;
		get(url, data, callback);
	  },
	  getNodeTaskLogByUPID: function(node, upid, callback) {
		data = {};
		url = '/nodes/'+node+'/tasks/'+upid+'/log';
		get(url, data, callback);
	  },
	  getNodeTaskStatusByUPID: function(node, upid, callback) {
		data = {};
		url = '/nodes/'+node+'/tasks/'+upid+'/status';
		get(url, data, callback);
	  },
	  getNodeScanMethods: function(node, callback) {
		data = {};
		url = '/nodes/'+node+'/scan';
		get(url, data, callback);
	  },
	  getRemoteiSCSI: function(node, callback) {
		data = {};
		url = '/nodes/'+node+'/scan/iscsi';
		get(url, data, callback);
	  },
	  getNodeLVMGroups: function(node, callback) {
		data = {};
		url = '/nodes/'+node+'/scan/lvm';
		get(url, data, callback);
	  },
	  getRemoteNFS: function(node, callback) {
		data = {};
		url = '/nodes/'+node+'/scan/nfs';
		get(url, data, callback);
	  },
  	  getNodeUSB: function(node, callback) {
		data = {};
		url = '/nodes/'+node+'/scan/usb';
	  },
	  getStorageVolumeData: function(node, storage, volume, callback) {
		data = {};
		url = '/nodes/'+node+'/storage/'+storage+'/content/'+volume;
		get(url, data, callback);
	  },
	  getStorageConfig: function(storage, callback) {
		data = {};
		url = '/storage/'+storage;
		get(url, data, callback);
	  },
	  getNodeStorageContent: function(node, storage, callback) {
    data = {};
		url = '/nodes/'+node+'/storage/'+storage+'/content';
		get(url, data, callback);
	  },
	  getNodeStorageRRD: function(node, storage, callback) {
		data = {};
		url = '/nodes/'+node+'/storage/'+storage+'/rrd';
		get(url, data, callback);
	  },
	  getNodeStorageRRDData: function(node, storage, callback) {
		data = {};
		url = '/nodes/'+node+'/storage/'+storage+'/rrddata';
		get(url, data, callback);
	  },
    //openvz functions
          openvz: {
		createOpenvzContainer: function(node, data, callback) {
		  url = '/nodes/' + node + '/openvz'
		  post(url, data, callback);
		},
		mountOpenvzPrivate: function(node, vmid, callback) {
		  data = {};
		  url = '/nodes/' + node + '/openvz/' + vmid + '/status/mount';
		  post(url, data, callback);
		},
		shutdownOpenvzContainer: function(node, vmid, callback) {
		  data = {};
		  url = '/nodes/' + node + '/openvz/' + vmid + '/status/shutdown';
		  post(url, data, callback);
		},
		startOpenvzContainer: function(node, vmid, callback) {
		  data = {};
		  url = '/nodes/' + node + '/openvz/' + vmid + '/status/start';
		  post(url, data, callback);
		},
	 	stopOpenvzContainer: function(node, vmid, callback) {
		  data = {};
		  url = '/nodes/' + node + '/openvz/' + vmid + '/status/stop';
		  post(url, data, callback);
		},
		unmountOpenvzContainer: function(node, vmid, callback) {
		  data = {};
		  url = '/nodes/' + node + '/openvz/' + vmid + '/status/unmount';
		  post(url, data, callback);
		},
		migrateOpenvzContainer: function(node, vmid, target, callback) {
		  data = {'target': target};
		  url = '/nodes/' + node + '/openvz/' + vmid + '/migrate';
		  post(url, data, callback);
		},
		getContainerIndex: function(node, vmid, callback) {
		  data = {};
		  url = '/nodes/'+node+'/openvz/'+vmid;
		  get(url, data, callback);
		},
		getContainerStatus: function(node, vmid, callback) {
		  data = {};
		  url = '/nodes/'+node+'/openvz/'+node+'/status/current';
		  get(url, data, callback);
		},
		getContainerBeans: function(node, vmid, callback) {
		  data = {};
		  url = '/nodes/'+node+'/openvz/'+vmid+'/status/ubc';
		  get(url, data, callback);
		},
		getContainerConfig: function(node, vmid, callback) {
		  data = {};
		  url = '/nodes/'+node+'/openvz/'+vmid+'/config';
		  get(url, data, callback);
		},
		getContainerInitLog: function(node, vmid, callback) {
		  data = {};
		  url = '/nodes/'+node+'/openvz/'+vmid+'/initlog';
		  get(url, data, callback);
		},
		getContainerRRD: function(node, vmid, callback) {
		  data = {};
		  url = '/nodes/'+node+'/openvz/'+vmid+'/rrd';
		  get(url, data, callback);
		},
		getContainerRRDData: function(node, vmid, callback) {
		  data = {};
		  url = '/nodes/'+node+'/openvz/'+vmid+'/rrddata';
		  get(url, data, callback);
		},
		deleteOpenvzContainer: function(node, vmid, callback) {
		  data = {};
		  url = '/nodes/'+node+'/openvz/'+vmid;
		  del(url, data, callback);
		},
		setOpenvzContainerOptions: function(node, vmid, data, calback) {
		  url = '/nodes/'+node+'/openvz/'+vmid+'/config';
		  put(url, data, callback);
		}
	  },

	  deleteNodeNetworkConfig: function(node, callback) {
	    data = {};
	    url = '/nodes/'+node+'/network';
	    del(url, data, callback);
	  },
	  deleteNodeInterface: function(node, interface, callback) {
	    data = {};
	    url = '/nodes/'+node+'/network/'+interface;
	    del(url, data, callback);
	  },
	  deletePool: function(poolid, callback){
	    data = {};
	    url = '/pools/'+poolid;
	    del(url, data, callback);
	  },
	  setNodeDNSDomain: function(node, domain, callback) {
	    data = {'search': domain};
	    url = '/nodes/'+node+'/dns';
	    put(url, data, callback);
	  },
	  setNodeSubscriptionKey: function(node, key, callback) {
	    data = {'key': key};
	    url = '/nodes/'+node+'/subscription';
	    put(url, data, callback);
	  },
	  setNodeTimeZone: function(node, timezone, callback) {
	    data = {'timezone':timezone};
	    url = '/nodes/'+node+'/time';
	    put(url, data, callback);
	  },
	  setPoolData: function(poolid, data, callback) {
	    url = '/pools/'+poolid;
	    put(url, data, callback);
	  },
	  updateStorageConfiguration: function(storageid, data, callback) {
	    url = '/storage/'+storageid;
	    put(url, data, callback);
	  },
    //self added functions
    getNodes: function (callback) {
      data = {};
      url = '/nodes/';
      get(url,data,callback);
    },
    getStorage: function (callback) {
      data = {};
      url = '/storage/';
      get(url,data,callback);
    },
    getQemu: function (node, callback) {
      data = {};
      url = '/nodes/' + node + '/qemu';
      get(url,data,callback);
    },
    createQemu: function (node, data, callback) {
      url = '/nodes/' + node + '/qemu';
      post(url,data,callback);
    },
    //vm functions
            qemu: {
    getStatus: function (node, qemu, callback) {
      data = {};
      url = '/nodes/' + node + '/qemu/' + qemu + '/status/';
      get (url,data,callback);
    },
    get: function (node, qemu, callback) {
      data = {};
      url = '/nodes/' + node + '/qemu/' + qemu;
      get(url,data,callback);
    },
    del: function (node, qemu, callback) {
      data = {};
      url = '/nodes/' + node + '/qemu/' + qemu;
      del(url,data,callback);
    },
    getStatusCurrent: function (node, qemu, callback) {
        data = {};
        url = '/nodes/' + node + '/qemu/' + qemu + '/status/current'
        get(url,data,callback);
      },
    start: function (node, qemu, callback) {
        data = {};
        url = '/nodes/' + node + '/qemu/' + qemu + '/status/start';
        post(url,data,callback);
      },
    stop: function (node, qemu, callback) {
        data = {};
        url = '/nodes/' + node + '/qemu/' + qemu + '/status/stop';
        post(url,data,callback);
      },
    reset: function (node, qemu, callback) {
      data = {};
      url = '/nodes/' + node + '/qemu/' + qemu + '/status/reset';
      post(url,data,callback);
    },
    shutdown: function (node, qemu, callback) {
      data = {};
      url = '/nodes/' + node + '/qemu/' + qemu + '/status/shutdown';
      post(url,data,callback);
    },
    suspend: function (node, qemu, callback) {
      data = {};
      url = '/nodes/' + node + '/qemu/' + qemu + '/status/suspend';
      post(url,data,callback);
    },
    resume: function (node, qemu, callback) {
      data = {};
      url = '/nodes/' + node + '/qemu/' + qemu + '/status/resume';
      post(url,data,callback);
    },
    //snapshot functions
      snapshot: {
    list: function (node, qemu, callback) {
      data = {};
      url = '/nodes/' + node + '/qemu/' + qemu + '/snapshot';
      get(url,data,callback);
    },
    get: function (node, qemu, snapname, callback) {
      data = {};
      url = '/nodes/' + node + '/qemu/' + qemu + '/snapshot/' + snapname;
      get(url,data,callback);
    },
    getConfig: function (node, qemu, snapname, callback) {
      data = {};
      url = '/nodes/' + node + '/qemu/' + qemu + '/snapshot/' + snapname + '/config';
      get(url,data,callback);
    },
    putConfig: function (node, qemu, snapname, data, callback) {
      url = '/nodes/' + node + '/qemu/' + qemu + '/snapshot/' + snapname + '/config';
      put(url,data,callback);
    },
    rollback: function  (node, qemu, snapname, callback) {
      data = {};
      url = '/nodes/' + node + '/qemu/' + qemu + '/snapshot/' + snapname + '/rollback';
      post(url,data,callback);
    },
    delete: function (node, qemu, snapname, callback) {
      data = {};
      url = '/nodes/' + node + '/qemu/' + qemu + '/snapshot/' + snapname;
      del(url,data,callback);
    },
    make: function (node, qemu, data, callback) {
      url = '/nodes/' + node + '/qemu/' + qemu + '/snapshot';
      post(url,data,callback);
    },
  },
    rrd: function (node, qemu, data, callback) {
      url = '/nodes/' + node + '/qemu/' + qemu + '/rrd';
      get(url,data,callback);
    },
    rrdData: function (node, qemu, data, callback) {
      url = '/nodes/' + node + '/qemu/' + qemu + '/rrddata';
      get(url,data,callback);
    },
    getConfig: function (node,qemu, callback) {
      data = {};
      url = '/nodes/' + node + '/qemu/' + qemu + '/config';
      get(url, data, callback);
    },
    updateConfig: function (node, qemu, data, callback) {
      url = '/nodes/' + node + '/qemu/' + qemu + '/config';
      put(url,data,callback);
    },
    setConfig: function (node, qemu, data, callback) {
      url = '/nodes/' + node + '/qemu/' + qemu + '/config';
      post(url,data,callback);
    },
    pending: function (node, qemu, callback) {
      data = {};
      url = '/nodes/' + node + '/qemu/' + qemu + '/pending';
      get(url,data,callback);
    },
    unlink: function (node, qemu, data, callback) {
      url = '/nodes/' + node + '/qemu/' + qemu + '/unlink';
      put(url, data, callback);
    },
    vncproxy: function (node, qemu, callback) {
      data = {};
      url = '/nodes/' + node + '/qemu/' + qemu + '/vncproxy';
      post (url,data,callback);
    },
    vncwebsocket: function (node, qemu, data, callback) {
      url = '/nodes/' + node + '/qemu/' + qemu + '/vncwebsocket';
      get(url,data,callback);
    },
    spiceproxy: function (node, qemu, data, callback) {
      url = '/nodes/' + node + '/qemu/' + qemu + '/spiceproxy';
      post(url,data,callback);
    },
    sendkey: function (node, qemu, data, callback) {
      url = '/nodes/' + node + '/qemu/' + qemu + '/sendkey';
      put (url,data,callback);
    },
    feature: function (node, qemu, data, callback) {
      url = '/nodes/' + node + '/qemu/' + qemu + '/feature';
      get(url,data, callback);
    },
    clone: function (node, qemu, data, callback) {
      url = '/nodes/' + node + '/qemu/' + qemu + '/clone';
      post(url, data, callback);
    },
    moveDisk: function (node, qemu, data, callback) {
      url = '/nodes/' + node + '/qemu/' + qemu + '/move_disk';
      post(url,data,callback);
    },
    migrate: function (node, qemu, data, callback) {
      url = '/nodes/' + node + '/qemu/' + qemu + '/migrate';
      post(url,data,callback);
    },
    monitor: function (node, qemu, data, callback) {
      url = '/nodes/' + node + '/qemu/' + qemu + '/monitor';
      post(url,data,callback);
    },
    resize: function (node, qemu, data, callback) {
      url = '/nodes/' + node + '/qemu/' + qemu + '/resize';
      put(url,data,callback);
    },
    template: function (node, qemu, callback) {
      data = {};
      url = '/nodes/' + node + '/qemu/' + qemu + '/template';
      post(url,data,callback);
    },
    //firewall functions
          firewall: {
    list: function (node, qemu, callback) {
      data = {};
      url = '/nodes/' + node + '/qemu/' + qemu + '/firewall';
      get(url,data,callback);
    },
    listRules: function (node, qemu, callback) {
      data = {};
      url = '/nodes/' + node + '/qemu/' + qemu + '/firewall/rules';
      get(url,data,callback);
    },
    createRule: function (node, qemu, data, callback) {
      url = '/nodes/' + node + '/qemu/' + qemu + '/firewall/rules';
      post(url,data,callback);
    },
    getRule: function (node, qemu, pos, callback) {
      data = {};
      url = '/nodes/' + node + '/qemu/' + qemu + '/firewall/rules/' + pos;
      get(url,data,callback);
    },
    updateRule: function (node, qemu, pos, data, callback) {
      url = '/nodes/' + node + '/qemu/' + qemu + '/firewall/rules/' + pos;
      put(url,data,callback);
    },
    deleteRule: function (node, qemu, pos, callback) {
      data = {};
      url = '/nodes/' + node + '/qemu/' + qemu + '/firewall/rules/' + pos;
      del(url,data,callback);
    },
    listAlias: function (node, qemu, callback) {
      data = {};
      url = '/nodes/' + node + '/qemu/' + qemu + '/firewall/aliases';
      get(url,data,callback);
    },
    createAlias: function (node, qemu, data, callback) {
      url = '/nodes/' + node + '/qemu/' + qemu + '/firewall/aliases';
      post(url,data,callback);
    },
    getAlias: function (node, qemu, name, callback) {
        data = {};
        url = '/nodes/' + node + '/qemu/' + qemu + '/firewall/aliases/' + name;
        get(url,data,callback);
    },
    updateAlias: function (node, qemu, name, data, callback) {
        url = '/nodes/' + node + '/qemu/' + qemu + '/firewall/aliases/' + name;
        put(url,data,callback);
    },
    deleteAlias: function (node, qemu, name, callback) {
      data = {};
      url = '/nodes/' + node + '/qemu/' + qemu + '/firewall/aliases/' + name;
      del(url,data,callback);
    },
    listIpset: function (node, qemu, callback) {
      data = {};
      url = '/nodes/' + node + '/qemu/' + qemu + '/firewall/ipset';
      get(url,data,callback);
    },
    createIpset: function (node, qemu, data, callback) {
      url = '/nodes/' + node + '/qemu/' + qemu + '/firewall/ipset';
      post(url,data,callback);
    },
    getIpsetContent: function (node, qemu, name, callback) {
      data = {};
      url = '/nodes/' + node + '/qemu/' + qemu + '/firewall/ipset/' + name;
      get(url,data,callback);
    },
    addIpToIpset: function (node, qemu, name, data, callback) {
      url = '/nodes/' + node + '/qemu/' + qemu + '/firewall/ipset/' + name;
      post(url,data,callback);
    },
    deleteIpset: function (node, qemu, name, callback) {
      data = {};
      url = '/nodes/' + node + '/qemu/' + qemu + '/firewall/ipset/' + name;
      del(url,data,callback);
    },
    getIpfromIpset: function (node, qemu, name, cidr, callback) {
      data = {};
      url = '/nodes/' + node + '/qemu/' + qemu + '/firewall/ipset/' + name + '/' + cidr;
      get(url,data,callback);
    },
    updateIpfromIpset: function (node, qemu, name, cidr, data, callback) {
      url = '/nodes/' + node + '/qemu/' + qemu + '/firewall/ipset/' + name + '/' + cidr;
      put(url,data,callback);
    },
    deleteIpfromIpset: function (node, qemu, name, cidr, callback) {
      data = {};
      url = '/nodes/' + node + '/qemu/' + qemu + '/firewall/ipset/' + name + '/' + cidr;
      del(url,data,callback);
    },
    getOptions: function (node, qemu, callback) {
      data = {};
      url = '/nodes/' + node + '/qemu/' + qemu + '/firewall/options';
      get(url,data,callback);
    },
    setOptions: function (node, qemu, data, callback) {
      url = '/nodes/' + node + '/qemu/' + qemu + '/firewall/options';
      put(url,data,callback);
    },
    getLog: function (node, qemu, callback) {
      data = {};
      url = '/nodes/' + node + '/qemu/' + qemu + '/firewall/log';
      get(url,data,callback);
    },
    getRefs: function (node, qemu, callback) {
      data = {};
      url = '/nodes/' + node + '/qemu/' + qemu + '/firewall/refs';
      get(url,data,callback);
    },
    },
  },
        network: {
    list: function (node, callback) {
      data = {};
      url = '/nodes/' + node + '/network';
      get(url,data,callback);
    },
    create: function (node, data, callback) {
      url = '/nodes/' + node + '/network';
      post(url,data,callback);
    },
    get: function(node, iface, callback) {
      data = {};
      url = '/nodes/' + node + '/network/' + iface;
      get(url,data,callback);
    },
    update: function(node, iface, data, callback) {
      url = '/nodes/' + node + '/network/' + iface;
      put(url,data,callback);
    },
    deleteIface: function(node, iface, callback) {
      data = {};
      url = '/nodes/' + node + '/network/' + iface;
      del(url,data,callback);
    },
    delete: function (node, callback) {
      data = {};
      url = '/nodes/' + node + '/network';
      del(url,data,callback);
    }
  },
  //access functions
  access: {
    listUsers: function (callback) {
      data = {};
      url = '/access/users';
      get(url,data, callback);
    },
    createUser: function (data, callback) {
      url = '/access/users';
      post(url,data,callback);
    },
    getUser: function(user, callback) {
      data = {};
      url = '/access/users/' + user;
      get(url,data,callback);
    },
    updateUser: function (user, data, callback) {
      url = '/access/users/' + user;
      put(url,data,callback);
    },
    deleteUser: function (user, callback) {
        data = {};
        url = '/access/users/' + user;
        del(url,data,callback);
    },
    listGroups: function (callback) {
      data = {};
      url = '/access/groups';
      get(url,data,callback);
    },
    createGroup: function (data, callback) {
      url = '/access/groups';
      post(url,data,callback);
    },
    getGroup: function (group, callback) {
      data = {};
      url = '/access/groups/' + group;
      get(url,data,callback);
    },
    updateGroup: function (group, data, callback) {
      url = '/access/groups/' + group;
      put(url,data,callback);
    },
    deleteGroup: function (group, data, callback) {
      url = '/access/groups/' + group;
      del(url,data,callback);
    },
    listRoles: function (callback) {
      data = {};
      url = '/access/roles';
      get(url,data,callback);
    },
    createRole: function (data, callback) {
      url = '/access/roles';
      post(url,data,callback);
    },
    getRole: function (role, callback) {
      data = {};
      url = '/access/roles/' + role;
      get(url,data,callback);
    },
    updateRole: function (role, data, callback) {
      url = '/access/roles/' + role;
      put(url,data,callback);
    },
    deleteRole: function(role,callback) {
      data = {};
      url = '/access/roles/' + role;
      del(url,data,callback);
    },
    listDomains:  function(callback) {
      data = {};
      url = '/access/domains';
      get(url,data,callback);
    },
    createDomain: function (data, callback) {
      url = '/access/domains';
      post(url,data,callback);
    },
    getDomain: function (domain, callback) {
      data = {};
      url = '/access/domains/' + domain;
      get(url,data,callback);
    },
    updateDomain: function(domain, data, callback) {
      url = '/access/domains/' + domain;
      put(url,data,callback);
    },
    deleteDomain: function(domain, callback) {
      data = {};
      url = '/access/domains/' + domain;
      del(url,data,callback);
    },
    getAcl: function (callback) {
      data = {};
      url = '/access/acl';
      get(url,data,callback);
    },
    updateAcl: function (data, callback) {
      url = '/access/acl';
      put(url,data,callback);
    },
    getTicket: function (callback) {
      data = {};
      url = '/access/ticket';
      get(url,data,callback);
    },
    postTicket: function (data, callback) {
      url = '/access/ticket';
      post(url,data,callback);
    },
    password: function (data, callback) {
      url = '/access/password';
      put(url,data,callback);
    },
  },
  //pool functions
    pools : {
      list: function (callback) {
        data = {};
        url = '/pools';
        get(url,data,callback);
      },
      create: function (data, callback) {
        url = '/pools';
        post(url,data,callback);
      },
      get: function (pool, callback) {
        data = {};
        url = '/pools/' + pool;
        get(url,data,callback);
      },
      update: function(pool, data, callback) {
        url = '/pools/' + pool;
        put(url,data,callback);
      },
      delete: function (pool, callback) {
        data = {};
        url = '/pools/' + pool;
        del(url,data,callback);
      }
    },
    //storage functions
    storage : {
      list: function (callback) {
        data = {};
        url = '/storage';
        get(url,data,callback);
      },
      create: function (data, callback) {
        url = '/storage';
        post(url,data,callback);
      },
      get: function (storage, callback) {
        data = {};
        url = '/storage/' + storage;
        get(url,data,callback);
      },
      update: function (storage, data, callback) {
        url = '/storage/' + storage;
        put(url,data,callback);
      },
      delete: function (storage, callback) {
        data = {};
        url = '/storage/' + storage;
        del(url,data,callback);
      },

    },
    getCluster: function (callback) {
      data = {};
      url = '/cluster';
      get(url,data,callback);
    },

    cluster: {
      getFirewall: function (callback) {
        data = {};
        url = '/cluster/firewall';
        get(url,data,callback);
      },
      getResources: function (callback) {
        data = {};
        url = '/cluster/resources';
        get(url,data, callback);
      },
      getTasks: function (callback) {
        data = {};
        url = '/cluster/tasks';
        get(url,data,callback);
      },
      getOptions: function (callback) {
        data = {};
        url = '/cluster/options';
        get(url,data,callback);
      },
      updateOptions: function (data, callback) {
        url = '/cluster/options';
        put(url,data,callback);
      },
      getStatus: function (callback) {
        data = {};
        url = '/cluster/status';
        get(url,data,callback);
      },
      getNextid: function (callback) {
        data = {};
        url = '/cluster/nextid';
        get(url,data,callback);
      }
    },
    getCeph: function (node, callback) {
      data = {};
      url = '/nodes/' + node + '/ceph';
      get(url,data,callback);
    },
    node : {
      getStatus: function (node, callback) {
        data = {};
        url = '/nodes/' + node +'/status';
        get(url,data,callback);
      }
    },

lxc : {
get : function (node,callback) {
data = {};
url = '/nodes/' + node + '/lxc';
get(url,data,callback);
},

create : function (node,data,callback) {
url = '/nodes/' + node + '/lxc';
post(url,data,callback);
},

getvm : function (node,vmid,callback) {
data = {};
url = '/nodes/' + node + '/lxc/' + vmid;
get(url,data,callback);
},

deletevm : function (node,vmid,callback) {
url = '/nodes/' + node + '/lxc/' + vmid;
del(url,data,callback);
},

getConfig : function (node,vmid,callback) {
data = {};
url = '/nodes/' + node + '/lxc/' + vmid + '/config';
get(url,data,callback);
},

putConfig : function (node,vmid,data,callback) {
url = '/nodes/' + node + '/lxc/' + vmid + '/config';
put(url,data,callback);
},

vmConfigResize : function (node,vmid,data,callback) {
url = '/nodes/' + node + '/lxc/' + vmid + '/config/' + vmid + '/resize';
put(url,data,callback);
},

vmGetStatus : function (node,vmid,callback) {
data = {};
url = '/nodes/' + node + '/lxc/' + vmid + '/status';
get(url,data,callback);
},

vmGetStatusCurrent : function (node,vmid,callback) {
data = {};
url = '/nodes/' + node + '/lxc/' + vmid + '/status/' + '/current';
get(url,data,callback);
},

vmStart : function (node,vmid,data,callback) {
url = '/nodes/' + node + '/lxc/' + vmid + '/status/' + '/start';
post(url,data,callback);
},

vmStop : function (node,vmid,data,callback) {
url = '/nodes/' + node + '/lxc/' + vmid + '/status/' + '/stop';
post(url,data,callback);
},

vmShutdown: function (node,vmid,data,callback) {
url = '/nodes/' + node + '/lxc/' + vmid + '/status/' + '/shutdown';
post(url,data,callback);
},

vmSuspend : function (node,vmid,data,callback) {
url = '/nodes/' + node + '/lxc/' + vmid + '/status/' + '/suspend';
post(url,data,callback);
},

vmResume : function (node,vmid,data,callback) {
url = '/nodes/' + node + '/lxc/' + vmid + '/status/' + '/resume';
post(url,data,callback);
},

vmListSnapshot : function (node,vmid,callback) {
data = {};
url = '/nodes/' + node + '/lxc/' + vmid + '/snapshot';
get(url,data,callback);
},

vmCreateSnapshot : function (node,vmid,data,callback) {
url = '/nodes/' + node + '/lxc/' + vmid + '/snapshot';
post(url,data,callback);
},

vmGetSnapshot : function (node,vmid,snapname,callback) {
data = {};
url = '/nodes/' + node + '/lxc/' + vmid + '/snapshot/' + snapname;
get(url,data,callback);
},

vmDeleteSnapshot : function (node,vmid,snapname,callback) {
url = '/nodes/' + node + '/lxc/' + vmid + '/snapshot/' + snapname;
del(url,data,callback);
},

vmSnapshotRollback : function (node,vmid,snapname,data,callback) {
url = '/nodes/' + node + '/lxc/' + vmid + '/snapshot/' + snapname + '/rollback';
post(url,data,callback);
},

vmGetSnapshotConfig : function (node,vmid,snapname,callback) {
data = {};
url = '/nodes/' + node + '/lxc/' + vmid + '/snapshot/' + snapname + '/config';
get(url,data,callback);
},

vmPutSnapshotConfig : function (node,vmid,snapname,data,callback) {
url = '/nodes/' + node + '/lxc/' + vmid + '/snapshot/' + snapname + '/config';
put(url,data,callback);
},

vmGetFirewall : function (node,vmid,callback) {
data = {};
url = '/nodes/' + node + '/lxc/' + vmid + '/firewall';
get(url,data,callback);
},

vmGetFirewallRules : function (node,vmid,callback) {
data = {};
url = '/nodes/' + node + '/lxc/' + vmid + '/firewall/' + '/rules';
get(url,data,callback);
},

vmSetFirewallRules : function (node,vmid,data,callback) {
url = '/nodes/' + node + '/lxc/' + vmid + '/firewall/' + '/rules';
post(url,data,callback);
},

vmGetFirewallRule : function (node,vmid,pos,callback) {
data = {};
url = '/nodes/' + node + '/lxc/' + vmid + '/firewall/' + '/rules/' + pos;
get(url,data,callback);
},

vmSetFirewallRule : function (node,vmid,pos,data,callback) {
url = '/nodes/' + node + '/lxc/' + vmid + '/firewall/' + '/rules/' + pos;
put(url,data,callback);
},

vmDeleteFirewallRule : function (node,vmid,pos,callback) {
url = '/nodes/' + node + '/lxc/' + vmid + '/firewall/' + '/rules/' + pos;
del(url,data,callback);
},

vmGetFirewallAliases : function (node,vmid,callback) {
data = {};
url = '/nodes/' + node + '/lxc/' + vmid + '/firewall/' + '/aliases';
get(url,data,callback);
},

vmSetFirewallAliases : function (node,vmid,data,callback) {
url = '/nodes/' + node + '/lxc/' + vmid + '/firewall/' + '/aliases';
post(url,data,callback);
},

vmGetFirewallAlias : function (node,vmid,name,callback) {
data = {};
url = '/nodes/' + node + '/lxc/' + vmid + '/firewall/' + '/aliases/' + name;
get(url,data,callback);
},

vmSetFirewallAlias : function (node,vmid,name,data,callback) {
url = '/nodes/' + node + '/lxc/' + vmid + '/firewall/' + '/aliases/' + name;
put(url,data,callback);
},

vmDeleteFirewallAlias : function (node,vmid,name,callback) {
url = '/nodes/' + node + '/lxc/' + vmid + '/firewall/' + '/aliases/' + name;
del(url,data,callback);
},

vmListFirewallIpset : function (node,vmid,callback) {
data = {};
url = '/nodes/' + node + '/lxc/' + vmid + '/firewall/' + '/ipset';
get(url,data,callback);
},

vmCreateFirewallIpset : function (node,vmid,data,callback) {
url = '/nodes/' + node + '/lxc/' + vmid + '/firewall/' + '/ipset';
post(url,data,callback);
},

vmGetFirewallIpset : function (node,vmid,name,callback) {
data = {};
url = '/nodes/' + node + '/lxc/' + vmid + '/firewall/' + '/ipset/' + name;
get(url,data,callback);
},

vmSetFirewallIpset : function (node,vmid,name,data,callback) {
url = '/nodes/' + node + '/lxc/' + vmid + '/firewall/' + '/ipset/' + name;
post(url,data,callback);
},

vmDeleteFirewallIpset : function (node,vmid,name,callback) {
url = '/nodes/' + node + '/lxc/' + vmid + '/firewall/' + '/ipset/' + name;
del(url,data,callback);
},

vmGetFirewallIpsetCidr : function (node,vmid,name,cidr,callback) {
data = {};
url = '/nodes/' + node + '/lxc/' + vmid + '/firewall/' + '/ipset/' + name + cidr;
get(url,data,callback);
},

vmSetFirewallIpsetCidr : function (node,vmid,name,cidr,data,callback) {
url = '/nodes/' + node + '/lxc/' + vmid + '/firewall/' + '/ipset/' + name + cidr;
put(url,data,callback);
},

vmDeleteFirewallIpsetCidr : function (node,vmid,name,cidr,callback) {
url = '/nodes/' + node + '/lxc/' + vmid + '/firewall/' + '/ipset/' + name + cidr;
del(url,data,callback);
},

vmGetFirewallOptions : function (node,vmid,callback) {
data = {};
url = '/nodes/' + node + '/lxc/' + vmid + '/firewall/' + '/options';
get(url,data,callback);
},

vmSetFirewallOptions : function (node,vmid,data,callback) {
url = '/nodes/' + node + '/lxc/' + vmid + '/firewall/' + '/options';
put(url,data,callback);
},

vmGetFirewallLog : function (node,vmid,callback) {
data = {};
url = '/nodes/' + node + '/lxc/' + vmid + '/firewall/' + '/log';
get(url,data,callback);
},

vmGetFirewallRefs : function (node,vmid,callback) {
data = {};
url = '/nodes/' + node + '/lxc/' + vmid + '/firewall/' + '/refs';
get(url,data,callback);
},

vmidgetrrd : function (node,vmid,callback) {
data = {};
url = '/nodes/' + node + '/lxc/' + vmid + '/rrd';
get(url,data,callback);
},

vmidgetrrddata : function (node,vmid,callback) {
data = {};
url = '/nodes/' + node + '/lxc/' + vmid + '/rrddata';
get(url,data,callback);
},

vmidpostvncproxy : function (node,vmid,data,callback) {
url = '/nodes/' + node + '/lxc/' + vmid + '/vncproxy';
post(url,data,callback);
},

vmidgetvncwebsocket : function (node,vmid,callback) {
data = {};
url = '/nodes/' + node + '/lxc/' + vmid + '/vncwebsocket';
get(url,data,callback);
},

vmidpostspiceproxy : function (node,vmid,data,callback) {
url = '/nodes/' + node + '/lxc/' + vmid + '/spiceproxy';
post(url,data,callback);
},

vmidpostmigrate : function (node,vmid,data,callback) {
url = '/nodes/' + node + '/lxc/' + vmid + '/migrate';
post(url,data,callback);
},

vmGetFeature : function (node,vmid,callback) {
data = {};
url = '/nodes/' + node + '/lxc/' + vmid + '/feature';
get(url,data,callback);
},

vmSetTemplate : function (node,vmid,data,callback) {
url = '/nodes/' + node + '/lxc/' + vmid + '/template';
post(url,data,callback);
},

},
ceph : {
get : function (node,callback) {
data = {};
url = '/nodes/' + node + '/ceph';
get(url,data,callback);
},

getosd : function (node,callback) {
data = {};
url = '/nodes/' + node + '/ceph/' + '/osd';
get(url,data,callback);
},

postosd : function (node,data,callback) {
url = '/nodes/' + node + '/ceph/' + '/osd';
post(url,data,callback);
},

osddeleteosdid : function (node,osdid,callback) {
url = '/nodes/' + node + '/ceph/' + '/osd/' + osdid;
del(url,data,callback);
},

osdosdidpostin : function (node,osdid,data,callback) {
url = '/nodes/' + node + '/ceph/' + '/osd/' + osdid + '/in';
post(url,data,callback);
},

osdosdidpostout : function (node,osdid,data,callback) {
url = '/nodes/' + node + '/ceph/' + '/osd/' + osdid + '/out';
post(url,data,callback);
},

getmon : function (node,callback) {
data = {};
url = '/nodes/' + node + '/ceph/' + '/mon';
get(url,data,callback);
},

postmon : function (node,data,callback) {
url = '/nodes/' + node + '/ceph/' + '/mon';
post(url,data,callback);
},

mondeletemonid : function (node,monid,callback) {
url = '/nodes/' + node + '/ceph/' + '/mon/' + monid;
del(url,data,callback);
},

getpools : function (node,callback) {
data = {};
url = '/nodes/' + node + '/ceph/' + '/pools';
get(url,data,callback);
},

postpools : function (node,data,callback) {
url = '/nodes/' + node + '/ceph/' + '/pools';
post(url,data,callback);
},

poolsdeletename : function (node,name,callback) {
url = '/nodes/' + node + '/ceph/' + '/pools/' + name;
del(url,data,callback);
},

getdisks : function (node,callback) {
data = {};
url = '/nodes/' + node + '/ceph/' + '/disks';
get(url,data,callback);
},

getconfig : function (node,callback) {
data = {};
url = '/nodes/' + node + '/ceph/' + '/config';
get(url,data,callback);
},

postinit : function (node,data,callback) {
url = '/nodes/' + node + '/ceph/' + '/init';
post(url,data,callback);
},

poststop : function (node,data,callback) {
url = '/nodes/' + node + '/ceph/' + '/stop';
post(url,data,callback);
},

poststart : function (node,data,callback) {
url = '/nodes/' + node + '/ceph/' + '/start';
post(url,data,callback);
},

getstatus : function (node,callback) {
data = {};
url = '/nodes/' + node + '/ceph/' + '/status';
get(url,data,callback);
},

getcrush : function (node,callback) {
data = {};
url = '/nodes/' + node + '/ceph/' + '/crush';
get(url,data,callback);
},

getlog : function (node,callback) {
data = {};
url = '/nodes/' + node + '/ceph/' + '/log';
get(url,data,callback);
},

},
services : {
get : function (node,callback) {
data = {};
url = '/nodes/' + node + '/services';
get(url,data,callback);
},


getservice : function (node,service,callback) {
data = {};
url = '/nodes/' + node + '/services/' + service;
get(url,data,callback);
},

servicegetstate : function (node,service,callback) {
data = {};
url = '/nodes/' + node + '/services/' + service + '/state';
get(url,data,callback);
},

servicepoststart : function (node,service,data,callback) {
url = '/nodes/' + node + '/services/' + service + '/start';
post(url,data,callback);
},

servicepoststop : function (node,service,data,callback) {
url = '/nodes/' + node + '/services/' + service + '/stop';
post(url,data,callback);
},

servicepostrestart : function (node,service,data,callback) {
url = '/nodes/' + node + '/services/' + service + '/restart';
post(url,data,callback);
},

servicepostreload : function (node,service,data,callback) {
url = '/nodes/' + node + '/services/' + service + '/reload';
post(url,data,callback);
},

servicereload : function (node,service,callback) {
url = '/nodes/' + node + '/services/' + service + '/reload';
(url,data,callback);
},
}
  }
}
