"use strict";

const { cloneDeep } = require("lodash");
const ProtoBufSerializer = require("../../../src/serializers/protobuf");
const P = require("../../../src/packets");

describe("Test ProtoBufSerializer constructor", () => {
	it("should create an empty options", () => {
		let serializer = new ProtoBufSerializer();
		expect(serializer).toBeDefined();
		expect(serializer.serialize).toBeDefined();
		expect(serializer.deserialize).toBeDefined();
	});
});

describe("Test ProtoBuf serializer", () => {

	const serializer = new ProtoBufSerializer();
	serializer.init();

	it("should serialize the disconnect packet", () => {
		const obj = {
			ver: "3",
			sender: "test-1",
		};
		const s = serializer.serialize(obj, P.PACKET_DISCONNECT);
		expect(s.length).toBe(11);

		const res = serializer.deserialize(s, P.PACKET_DISCONNECT);
		expect(res).toEqual(obj);
	});

	it("should serialize the heartbeat packet", () => {
		const obj = {
			ver: "3",
			sender: "test-1",
			cpu: 12.5
		};
		const s = serializer.serialize(obj, P.PACKET_HEARTBEAT);
		expect(s.length).toBe(20);

		const res = serializer.deserialize(s, P.PACKET_HEARTBEAT);
		expect(res).toEqual(obj);
	});

	it("should serialize the discover packet", () => {
		const obj = {
			ver: "3",
			sender: "test-1",
		};
		const s = serializer.serialize(obj, P.PACKET_DISCOVER);
		expect(s.length).toBe(11);

		const res = serializer.deserialize(s, P.PACKET_DISCOVER);
		expect(res).toEqual(obj);
	});

	it("should serialize the info packet", () => {
		const obj = {
			ver: "3",
			sender: "test-1",
			services: [
				{ name: "users", version: "2", settings: {}, metadata: {}, actions: {
					"users.create": {}
				}, events: {
					"user.created": {}
				}}
			],
			config: {},
			ipList: [ "127.0.0.1" ],
			hostname: "test-server",
			client: {
				type: "nodejs",
				version: "1.2.3",
				langVersion: "6.10.2",
			},
		};
		const s = serializer.serialize(cloneDeep(obj), P.PACKET_INFO);
		expect(s.length).toBe(185);

		const res = serializer.deserialize(s, P.PACKET_INFO);
		expect(res).toEqual(obj);

	});

	it("should serialize the event packet", () => {
		const obj = {
			ver: "3",
			sender: "test-1",
			event: "user.created",
			data: {
				a: 5,
				b: "Test"
			},
			broadcast: true
		};
		const s = serializer.serialize(cloneDeep(obj), P.PACKET_EVENT);
		expect(s.length).toBe(47);

		const res = serializer.deserialize(s, P.PACKET_EVENT);
		expect(res).toEqual(Object.assign(obj, { groups: []}));
	});

	it("should serialize the event packet with groups", () => {
		const obj = {
			ver: "3",
			sender: "test-1",
			event: "user.created",
			data: {
				a: 5,
				b: "Test"
			},
			groups: ["users", "payments"],
			broadcast: false
		};
		const s = serializer.serialize(cloneDeep(obj), P.PACKET_EVENT);
		expect(s.length).toBe(64);

		const res = serializer.deserialize(s, P.PACKET_EVENT);
		expect(res).toEqual(obj);
	});

	it("should serialize the event packet without data", () => {
		const obj = {
			ver: "3",
			sender: "test-1",
			event: "user.created",
			broadcast: true
		};
		const s = serializer.serialize(cloneDeep(obj), P.PACKET_EVENT);
		expect(s.length).toBe(27);

		const res = serializer.deserialize(s, P.PACKET_EVENT);
		expect(res).toEqual(Object.assign(obj, { groups: []}));
	});

	it("should serialize the request packet", () => {
		const obj = {
			ver: "3",
			sender: "test-1",
			id: "100",
			action: "posts.find",
			params: { id: 5 },
			meta: {
				user: {
					id: 1,
					roles: [ "admin" ]
				}
			},
			timeout: 1500,
			level: 4,
			metrics: true,
			parentID: "999",
			requestID: "12345"
		};
		const s = serializer.serialize(cloneDeep(obj), P.PACKET_REQUEST);
		expect(s.length).toBe(100);

		const res = serializer.deserialize(s, P.PACKET_REQUEST);
		expect(res).toEqual(obj);
	});

	it("should serialize the response packet with data", () => {
		const obj = {
			ver: "3",
			sender: "test-1",
			id: "12345",
			success: true,
			data: [
				{ id: 1, name: "John" },
				{ id: 2, name: "Jane" }
			],
			meta: {
				user: {
					id: 1,
					roles: [ "admin" ]
				}
			}
		};
		const s = serializer.serialize(cloneDeep(obj), P.PACKET_RESPONSE);
		expect(s.length).toBe(106);

		const res = serializer.deserialize(s, P.PACKET_RESPONSE);
		expect(res).toEqual(obj);
	});

	it("should serialize the response packet with error", () => {
		const obj = {
			ver: "3",
			sender: "test-1",
			id: "12345",
			success: false,
			error: {
				name: "ValidationError",
				message: "Invalid email!",
				code: 422,
				nodeID: "test-1",
				type: "ERR_INVALID_A",
				retryable: true,
				stack: "STACK_PLACEHOLDER",
				data: {
					a: 5
				},
			},
			meta: {
				user: {
					id: 1,
					roles: [ "admin" ]
				}
			}
		};
		const s = serializer.serialize(cloneDeep(obj), P.PACKET_RESPONSE);
		expect(s.length).toBe(225);

		const res = serializer.deserialize(s, P.PACKET_RESPONSE);
		expect(res).toEqual(obj);
	});

	it("should serialize the ping packet", () => {
		const obj = {
			ver: "3",
			sender: "test-1",
			time: 1234567
		};
		const s = serializer.serialize(obj, P.PACKET_PING);
		expect(s.length).toBe(15);

		const res = serializer.deserialize(s, P.PACKET_PING);
		expect(res).toEqual(Object.assign(obj, {
			time: {
				high: 0,
				low: 1234567,
				unsigned: false
			}
		}));
	});

	it("should serialize the pong packet", () => {
		const obj = {
			ver: "3",
			sender: "test-1",
			time: 1234567,
			arrived: 7654321,
		};
		const s = serializer.serialize(obj, P.PACKET_PONG);
		expect(s.length).toBe(20);

		const res = serializer.deserialize(s, P.PACKET_PONG);
		expect(res).toEqual(Object.assign(obj, {
			time: {
				high: 0,
				low: 1234567,
				unsigned: false
			},
			arrived: {
				high: 0,
				low: 7654321,
				unsigned: false
			}
		}));
	});

});

describe("Test ProtoBuf serializer with Gossip packets", () => {

	const serializer = new ProtoBufSerializer();
	serializer.init();

	it("should serialize the hello packet", () => {
		const obj = {
			ver: "3",
			sender: "test-1",
			host: "server-host",
			port: 45450,
		};
		const s = serializer.serialize(obj, P.PACKET_GOSSIP_HELLO);
		expect(s.length).toBe(28);

		const res = serializer.deserialize(s, P.PACKET_GOSSIP_HELLO);
		expect(res).toEqual(obj);
	});

	it("should serialize the empty REQUEST packet", () => {
		const obj = {
			ver: "3",
			sender: "test-1"
		};
		const s = serializer.serialize(cloneDeep(obj), P.PACKET_GOSSIP_REQ);
		expect(s.length).toBe(11);

		const res = serializer.deserialize(s, P.PACKET_GOSSIP_REQ);
		expect(res).toEqual(obj);
	});

	it("should serialize the full REQUEST packet", () => {
		const obj = {
			ver: "3",
			sender: "test-1",
			online: {
				"node-1": [1, 2, 3],
				"node-2": [150, 0, 0]
			},
			offline: {
				"node-3": 23,
				"node-4": 26854204
			}
		};
		const s = serializer.serialize(cloneDeep(obj), P.PACKET_GOSSIP_REQ);
		expect(s.length).toBe(83);

		const res = serializer.deserialize(s, P.PACKET_GOSSIP_REQ);
		expect(res).toEqual(obj);
	});

	it("should serialize the empty RESPONSE packet", () => {
		const obj = {
			ver: "3",
			sender: "test-1"
		};
		const s = serializer.serialize(cloneDeep(obj), P.PACKET_GOSSIP_RES);
		expect(s.length).toBe(11);

		const res = serializer.deserialize(s, P.PACKET_GOSSIP_RES);
		expect(res).toEqual(obj);
	});

	it("should serialize the full RESPONSE packet", () => {
		const obj = {
			ver: "3",
			sender: "test-1",
			online: {
				"node-1": [{ services: [] }, 2, 3],
				"node-2": [13, 56]
			},
			offline: {
				"node-3": 23,
				"node-4": 26854204
			}
		};
		const s = serializer.serialize(cloneDeep(obj), P.PACKET_GOSSIP_RES);
		expect(s.length).toBe(95);

		const res = serializer.deserialize(s, P.PACKET_GOSSIP_RES);
		expect(res).toEqual(obj);
	});

});

