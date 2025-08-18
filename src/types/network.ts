export type DeviceType = 'router' | 'switch' | 'firewall' | 'dns' | 'dwdm' | 'osn' | 'rtn' | 'ptn';
export type DeviceStatus = 'online' | 'offline' | 'warning' | 'critical' | 'maintenance';
export type Protocol = 'SNMP' | 'SSH' | 'Telnet' | 'REST API' | 'NETCONF';

export interface SNMPConfig {
  version: 'v1' | 'v2c' | 'v3';
  community?: string;
  username?: string;
  authPassword?: string;
  privPassword?: string;
  authProtocol?: 'MD5' | 'SHA';
  privProtocol?: 'DES' | 'AES';
  timeout?: number;
  retries?: number;
}

export interface NetworkDevice {
  id: string;
  name: string;
  type: DeviceType;
  ipAddress: string;
  protocol: Protocol;
  port?: number;
  status: DeviceStatus;
  lastSeen: Date;
  location?: string;
  description?: string;
  snmpConfig?: SNMPConfig;
  credentials?: {
    username: string;
    password: string;
    enablePassword?: string;
  };
  metrics: NetworkMetrics;
}

export interface NetworkMetrics {
  timestamp: Date;
  cpu: number;
  memory: number;
  temperature: number;
  uptime: number;
  status: DeviceStatus;
  
  // Métriques spécifiques aux routeurs
  interfaces?: NetworkInterface[];
  routing_table?: number;
  bgp_peers?: number;
  
  // Métriques spécifiques aux switches
  ports?: NetworkPort[];
  vlans?: number;
  mac_entries?: number;
  
  // Métriques spécifiques aux firewalls
  active_sessions?: number;
  blocked_connections?: number;
  threats_blocked?: number;
  
  // Métriques spécifiques aux serveurs DNS
  queries_per_second?: number;
  cache_hit_rate?: number;
  zones?: number;
  
  // Métriques spécifiques aux équipements optiques (DWDM, OSN)
  optical_power?: number;
  wavelengths?: number;
  alarms?: number;
  performance?: number;
  
  // Métriques spécifiques aux RTN
  radio_power?: number;
  modulation?: string;
  interference?: number;
  capacity?: number;
  
  // Métriques spécifiques aux PTN
  ethernet_ports?: number;
  mpls_tunnels?: number;
  qos_queues?: number;
  oam_sessions?: number;
}

export interface NetworkInterface {
  name: string;
  status: 'up' | 'down' | 'administratively down';
  bandwidth: number;
  traffic_in: number;
  traffic_out: number;
  errors_in?: number;
  errors_out?: number;
  description?: string;
}

export interface NetworkPort {
  port: number;
  status: 'up' | 'down';
  vlan: number;
  speed: string;
  duplex: 'full' | 'half';
  errors?: number;
  collisions?: number;
}

export interface NetworkAlarm {
  id: string;
  deviceId: string;
  severity: 'critical' | 'major' | 'minor' | 'warning' | 'info';
  message: string;
  timestamp: Date;
  acknowledged: boolean;
  cleared: boolean;
  category?: string;
  source?: string;
}

export interface NetworkTopology {
  nodes: NetworkNode[];
  links: NetworkLink[];
}

export interface NetworkNode {
  id: string;
  name: string;
  type: DeviceType;
  position: { x: number; y: number };
  status: DeviceStatus;
  metrics?: Partial<NetworkMetrics>;
}

export interface NetworkLink {
  id: string;
  source: string;
  target: string;
  bandwidth: number;
  status: 'up' | 'down';
  utilization: number;
  type: 'ethernet' | 'fiber' | 'wireless' | 'copper';
}
