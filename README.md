# Node Proxmox

## A node.js client for proxmox. See [Proxmox wiki](http://pve.proxmox.com/wiki/Main_Page)

###### [Proxmox API wiki](http://pve.proxmox.com/wiki/Proxmox_VE_API)
###### [Proxmox API referene](http://pve.proxmox.com/pve2-api-doc/)

##### Note: Requires cURL because node https module does not correctly transfer custom headers without a signed certificate even if you accept unauthorized

##### Installation

  ```npm install proxmox```

or install from here.

###### Example:

    proxmox = require("proxmox")('user', 'password', 'domain.com');

    proxmox.getClusterStatus(function(err, response){
	if(err) throw err;
	else{
	  data = JSON.parse(response);
	  console.log(data);
	}
    });

Callback is a function of the form ```function(err, response){}```
data is an object, not a string.
everything else is a string

All returned responses are strings that can be parsed in to JSON as per the API reference.

    getNodes(callback);

    getQemu(node, callback);

    createQemu(node, data,  callback)

    getStorage(callback);

    getClusterStatus(callback);

    getClusterBackupSchedule(callback);

    getNodeNetworks(node, callback);

    getNodeInterface(node, interface, callback);

    getNodeContainerIndex(node, callback);

    getNodeVirtualIndex(node, callback);

    getNodeServiceState(node, service, callback);

    getNodeStorage(node, callback);

    getNodeFinishedTasks(node, callback);

    getNodeDNS(node, callback);

    getNodeSyslog(node, callback);

    getNodeRRD(node, callback);

    getNodeRRDData(node, callback);

    getNodeBeans(node, callback);

    getNodeTaskByUPID(node, upid, callback);

    getNodeTaskStatusByUPID(node, upid, callback);

    getNodeTaskLogByUPID(node, upid, callback);

    getNodeTaskStatusByUPID(node, upid, callback);

    getNodeScanMethods(node, callback);

    getRemoteiSCSI(node, callback);

    getNodeLVMGroups(node, callback);

    getRemoteNFS(node, callback);

    getNodeUSB(node, callback);

    getStorageVolumeData(node, storage, volume, callback);

    getStorageConfig(storage, callback);

    getNodeStorageContent(node, storage, callback);

    getNodeStorageRRD(node, storage, callback);

    getNodeStorageRRDData(node, storage, callback);

    deleteNodeNetworkConfig(node, callback);

    deleteNodeInterface(node, interface, callback);

    deletePool(poolid, callback);

    setNodeDNSDomain(node, domain, callback);

    setNodeSubscriptionKey(node, key, callback);

    setNodeTimeZone(node, timezone, callback);

    setPoolData(poolid, data, callback);

    updateStorageConfiguration(storageid, data, callback);

### OpenVZ

    openvz.createOpenvzContainer(node, data, callback);

    openvz.mountOpenvzPrivate(node, vmid, callback);

    openvz.shutdownOpenvzContainer(node, vmid, callback);

    openvz.startOpenvzContainer(node, vmid, callback);

    openvz.stopOpenvzContainer(node, vmid, callback);

    openvz.unmountOpenvzContainer(node, vmid, callback);

    openvz.migrateOpenvzContainer(node, vmid, target, callback);

    openvz.getContainerIndex(node, vmid, callback);

    openvz.getContainerSTatus(node, vmid, callback);

    openvz.getContainerBeans(node, vmid, callback);

    openvz.getContainerConfig(node, vmid, callback);

    openvz.getContainerInitLog(node, vmid, callback);

    openvz.getContainerRRD(node, vmid, callback);

    openvz.getContainerRRDData(node, vmid, callback);

    openvz.deleteOpenvzContainer(node, vmid, callback);

    openvz.setOpenvzContainerOptions(node, vmid, data, callback);

### Qemu --- more info on permissions and data view the documentation.html

    qemu.getStatus (node, qemu, callback);

    qemu.getStatusCurrent (node, qemu, callback);

    qemu.start(node, qemu, callback);

    qemu.stop(node, qemu, callback);

    qemu.reset(node, qemu, callback);

    qemu.shutdown(node, qemu, callback);

    qemu.suspend(node, qemu, callback);

    qemu.resume(node, qemu, callback);

    qemu.rrd(node, qemu, callback);

    qemu.rrdData (node, qemu, callback);

    qemu.getConfig(node, qemu, callback);

    qemu.putConfig(node, qemu, data, callback);

    qemu.postConfig(node, qemu, data, callback);

    qemu.pending(node, qemu, callback);

    qemu.unlink(node, qemu, data, callback);

    qemu.vncproxy (node, qemu, callback);

    qemu.vncwebsocket(node, qemu, data, callback);

    qemu.sendkey(node, qemu, data, callback);

    qemu.feature (node, qemu, data, callback);

    qemu.clone (node, qemu, data, callback);

    qemu.moveDisk (node, qemu, data, callback);

    qemu.migrate (node, qemu, data, callback);

    qemu.monitor (node, qemu, data, callback);

    qemu.resize (node, qemu, data, callback);

    qemu.template (node, qemu, callback);

### snapshot  

    qemu.snapshot.list(node, qemu, callback);

    qemu.snapshot.snapshot(node, qemu, snapname, callback);

    qemu.snapshot.getConfig(node, qemu, snapname, callback);

    qemu.snapshot.putConfig(node, qemu, snapname, data, callback);

    qemu.snapshot.rollback(node,qemu, snapname, callback);

    qemu.snapshot.delete(node, qemu, snapname, callback);

    qemu.snapshot.make(node, qemu, data, callback);

### firewall

    qemu.firewall.list(node, qemu, callback);

    qemu.firewall.listRules(node, qemu, callback);

    qemu.firewall.createRule(node, qemu, data, callback);

    qemu.firewall.getRule (node, qemu, pos, callback);

    qemu.firewall.listAlias(node, qemu, callback);

    qemu.firewall.createAlias(node, qemu, data, callback);

    qemu.firewall.getAlias(node, qemu, name, callback);

    qemu.firewall.updateAlias(node, qemu, name, data, callback);

    qemu.firewall.listIpset(node, qemu, callback);

    qemu.firewall.createIpset(node, qemu, data, callback);

    qemu.firewall.getIpsetContent(node, qemu, name, callback);

    qemu.firewall.addIpToIpset(node, qemu, name, data, callback);

    qemu.firewall.deleteIpset(node, qemu, name, callback);

    qemu.firewall.getIpfromIpset(node, qemu, name, cidr, callback);

    qemu.firewall.updateIpfromIpset(node, qemu, name, cidr, data, callback);

    qemu.firewall.deleteIpfromIpset(node, qemu, name, cidr, callback);

    qemu.firewall.getOptions(node, qemu, callback);

    qemu.firewall.setOptions(node, qemu, data, callback);

    qemu.firewall.getLog(node, qemu, callback);

    qemu.firewall.getRefs(node, qemu, callback);

### network

    network.list (node, callback);

    network.create(node, data, callback);

    network.get (node, iface, callback);

    network.update (node, iface, data, callback);

    network.delete (node, callback);

    network.deleteIface (node, iface, callback);

### access

    access.listUsers (callback);

    access.createUser (data, callback);

    access.getUser(user, callback);

    access.updateUser (user, data, callback);

    access.deleteUser (user, callback);

    access.listGroups (callback);

    access.createGroup (data, callback);

    access.getGroup (group, callback);

    access.updateGroup (group, data, callback);

    access.deleteGroup (group, callback);

    access.listRoles (callback);

    access.createRole (data, callback);

    access.getRole (role, callback);

    access.updateRole (role, data, callback);

    access.deleteRole (role, callback);

    access.listDomains (callback);

    access.createDomain (data, callback);

    access.getDomain (domain, callback);

    access.updateDomain (domain, data, callback);

    access.deleteDomain (domain, callback);

    access.getAcl (callback);

    access.updateAcl (data, callback);

    access.getTicket (callback);

    access.postTicket(data, callback);

    access.password(data, callback);

### pools

    pools.list (callback);

    pools.create (data, callback);

    pools.get (pool, callback);

    pools.update (pool, data, callback);

    pools.delete (pool, callback);

### storage

    storage.list (callback);

    storage.create (data, callback);

    storage.get (storageId, callback);

    storage.update (storageId, data, callback);

    storage.delete (storageId, callback);

### cluster

  getFirewall (callback);

  getResources (callback);

  getTasks (callback);

  getOptions (callback);

  updateOptions (data, callback);

  getStatus (callback);

  getNextid (callback);

### lxc

  lxc.get(node, callback);

  lxc.create(node, data, callback);

  lxc.getvm (node, vmid, callback);

  lxc.deletevm (node, vmid, callback);

  lxc.getConfig (node, vmid, callback);

  lxc.putConfig (node, vmid, data, callback);

  lxc.vmConfigResize (node, vmid, data, callback);

  lxc.vmGetStatus (node, vmid, callback);

  lxc.vmGetStatusCurrent (node, vmid, callback);

  lxc.vmStart (node, vmid, data, callback);

  lxc.vmStop (node, vmid, data, callback);

  lxc.vmShutdown (node, vmid, data, callback);

  lxc.vmSuspend (node, vmid, data, callback);

  lxc.vmResume (node, vmid, data, callback);

  lxc.vmListSnapshot (node, vmid, callback);

  lxc.vmCreateSnapshot (node, vmid, data, callback);

  lxc.vmGetSnapshot (node, vmid, snapname, callback);

  lxc.vmDeleteSnapshot (node, vmid, snapname, callback);

  lxc.vmSnapshotRollback (node, vmid, snapname, data, callback);

  lxc.vmGetSnapshotConfig (node, vmid, snapname, callback);

  lxc.vmPutSnapshotConfig (node, vmid, snapname, data, callback);

  lxc.vmGetFirewall (node, vmid, callback);

  lxc.vmGetFirewallRules (node, vmid, callback);

  lxc.vmSetFirewallRules (node, vmid, data, callback);

  lxc.vmGetFirewallRule (node, vmid, pos, callback);

  lxc.vmSetFirewallRule (node, vmid, pos, data, callback);

  lxc.vmDeleteFirewallRule (node, vmid, pos, callback);

  lxc.vmGetFirewallAliases (node, vmid, callback);

  lxc.vmSetFirewallAliases (node, vmid, data, callback);

  lxc.vmGetFirewallAlias (node, vmid, name, callback);

  lxc.vmSetFirewallAlias (node, vmid, name, data, callback);

  lxc.vmDeleteFirewallAlias (node, vmid, name callback);

  lxc.vmListFirewallIpset (node, vmid, callback);

  lxc.vmCreateFirewallIpset (node, vmid, data, callback);

  lxc.vmGetFirewallIpset (node, vmid, name, callback);

  lxc.vmSetFirewallIpset (node, vmid, name, data, callback);

  lxc.vmDeleteFirewallIpset (node, vmid, name, callback);

  lxc.vmGetFirewallIpsetCidr (node, vmid, name, cidr, callback);

  lxc.vmSetFirewallIpsetCidr (node, vmid, name, cidr, data, callback);

  lxc.vmDeleteFirewallCidr (node, vmid, name, cidr, callback);

  lxc.vmGetFirewallOptions (node, vmid, callback);

  lxc.vmSetFirewallOptions (node, vmid, data, callback);

  lxc.vmGetFirewallLog (node, vmid, callback);

  lxc.vmGetFirewallRefs (node, vmid, callback);

  lxc.vmGetFeature (node, vmid, callback);

  lxc.vmSetTemplate (node, vmid, data, callback);

### To Do:
completed tests, examples, documentation, add methods for pool, node, KVM
