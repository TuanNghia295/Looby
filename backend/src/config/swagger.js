import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Looby API',
      version: '1.0.0',
      description: 'REST API for Looby chat application',
    },
    servers: [
      {
        url: 'http://localhost:5001',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '665f1a2b3c4d5e6f7a8b9c0d' },
            userName: { type: 'string', example: 'johndoe' },
            email: { type: 'string', example: 'john@example.com' },
            displayName: { type: 'string', example: 'John Doe' },
            avaterUrl: { type: 'string', example: 'https://cdn.example.com/avatar.jpg' },
            bio: { type: 'string', example: 'Hello world!' },
            phone: { type: 'string', example: '+84901234567' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Message: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            conversationId: { type: 'string' },
            senderId: {
              type: 'object',
              properties: {
                _id: { type: 'string' },
                displayName: { type: 'string' },
                avatarUrl: { type: 'string' },
              },
            },
            content: { type: 'string', example: 'Hello!' },
            imgeUrl: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Conversation: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            type: { type: 'string', enum: ['direct', 'group'] },
            participants: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  userId: { $ref: '#/components/schemas/User' },
                  joinedAt: { type: 'string', format: 'date-time' },
                },
              },
            },
            group: {
              type: 'object',
              nullable: true,
              properties: {
                name: { type: 'string' },
                createdBy: { $ref: '#/components/schemas/User' },
              },
            },
            lastMessage: {
              type: 'object',
              nullable: true,
              properties: {
                _id: { type: 'string', nullable: true },
                content: { type: 'string', nullable: true },
                senderId: { type: 'string', nullable: true },
                createdAt: { type: 'string', format: 'date-time', nullable: true },
              },
            },
            unreadCount: { type: 'object', additionalProperties: { type: 'number' } },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        FriendRequest: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            from: { $ref: '#/components/schemas/User' },
            to: { $ref: '#/components/schemas/User' },
            message: { type: 'string', example: 'Hi, let\'s be friends!' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Error: {
          type: 'object',
          properties: {
            message: { type: 'string' },
          },
        },
      },
    },
    security: [{ BearerAuth: [] }],
    paths: {
      // ── AUTH ────────────────────────────────────────────────────────────────
      '/api/auth/signup': {
        post: {
          tags: ['Auth'],
          summary: 'Register a new user',
          security: [],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['userName', 'password', 'email', 'firstName', 'lastName'],
                  properties: {
                    userName: { type: 'string', example: 'johndoe' },
                    password: { type: 'string', example: 'Secret123!' },
                    email: { type: 'string', example: 'john@example.com' },
                    firstName: { type: 'string', example: 'John' },
                    lastName: { type: 'string', example: 'Doe' },
                  },
                },
              },
            },
          },
          responses: {
            204: { description: 'User registered successfully' },
            400: { description: 'Missing required fields', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
            409: { description: 'Username or email already exists', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
            500: { description: 'Internal server error' },
          },
        },
      },
      '/api/auth/signin': {
        post: {
          tags: ['Auth'],
          summary: 'Sign in and receive access token',
          security: [],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['userName', 'password'],
                  properties: {
                    userName: { type: 'string', example: 'johndoe' },
                    password: { type: 'string', example: 'Secret123!' },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: 'Login successful. Sets `refreshToken` cookie.',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      message: { type: 'string' },
                      accessToken: { type: 'string' },
                    },
                  },
                },
              },
            },
            400: { description: 'Missing credentials' },
            401: { description: 'Invalid credentials' },
            500: { description: 'Internal server error' },
          },
        },
      },
      '/api/auth/logout': {
        post: {
          tags: ['Auth'],
          summary: 'Logout and invalidate refresh token',
          security: [],
          responses: {
            204: { description: 'Logged out successfully' },
          },
        },
      },
      '/api/auth/refresh': {
        post: {
          tags: ['Auth'],
          summary: 'Refresh access token using cookie',
          security: [],
          description: 'Uses the `refreshToken` cookie (set at sign-in). No request body required.',
          responses: {
            200: {
              description: 'New access token issued',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      accessToken: { type: 'string' },
                    },
                  },
                },
              },
            },
            401: { description: 'No refresh token provided' },
            403: { description: 'Token invalid or expired' },
            500: { description: 'Internal server error' },
          },
        },
      },

      // ── USERS ───────────────────────────────────────────────────────────────
      '/api/users/me': {
        get: {
          tags: ['Users'],
          summary: 'Get current authenticated user info',
          responses: {
            200: {
              description: 'Current user data',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/User' },
                },
              },
            },
            401: { description: 'Unauthorized' },
          },
        },
      },

      // ── FRIENDS ─────────────────────────────────────────────────────────────
      '/api/friends': {
        get: {
          tags: ['Friends'],
          summary: 'Get all friends of the current user',
          responses: {
            200: {
              description: 'List of friends',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      friends: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/User' },
                      },
                    },
                  },
                },
              },
            },
            401: { description: 'Unauthorized' },
            500: { description: 'Internal server error' },
          },
        },
      },
      '/api/friends/requests': {
        post: {
          tags: ['Friends'],
          summary: 'Send a friend request',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['to'],
                  properties: {
                    to: { type: 'string', description: 'Target user ID', example: '665f1a2b3c4d5e6f7a8b9c0d' },
                    message: { type: 'string', example: 'Hey, let\'s connect!' },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: 'Friend request sent',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      message: { type: 'string' },
                      request: { $ref: '#/components/schemas/FriendRequest' },
                    },
                  },
                },
              },
            },
            400: { description: 'Already friends or request already exists' },
            404: { description: 'Target user not found' },
            500: { description: 'Internal server error' },
          },
        },
      },
      '/api/friends/request': {
        get: {
          tags: ['Friends'],
          summary: 'Get sent and received friend requests',
          responses: {
            200: {
              description: 'Friend requests',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      sent: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/FriendRequest' },
                      },
                      received: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/FriendRequest' },
                      },
                    },
                  },
                },
              },
            },
            401: { description: 'Unauthorized' },
            500: { description: 'Internal server error' },
          },
        },
      },
      '/api/friends/requests/{requestId}/accept': {
        post: {
          tags: ['Friends'],
          summary: 'Accept a friend request',
          parameters: [
            { name: 'requestId', in: 'path', required: true, schema: { type: 'string' } },
          ],
          responses: {
            200: {
              description: 'Friend request accepted',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      message: { type: 'string' },
                      newFriend: { $ref: '#/components/schemas/User' },
                    },
                  },
                },
              },
            },
            403: { description: 'Not authorized to accept this request' },
            404: { description: 'Request not found' },
            500: { description: 'Internal server error' },
          },
        },
      },
      '/api/friends/request/{requestId}/decline': {
        post: {
          tags: ['Friends'],
          summary: 'Decline a friend request',
          parameters: [
            { name: 'requestId', in: 'path', required: true, schema: { type: 'string' } },
          ],
          responses: {
            204: { description: 'Friend request declined' },
            403: { description: 'Not authorized to decline this request' },
            404: { description: 'Request not found' },
            500: { description: 'Internal server error' },
          },
        },
      },

      // ── CONVERSATIONS ────────────────────────────────────────────────────────
      '/api/conversation': {
        get: {
          tags: ['Conversations'],
          summary: 'Get all conversations of the current user',
          parameters: [
            { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
            { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
          ],
          responses: {
            200: {
              description: 'Paginated list of conversations',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      count: { type: 'integer' },
                      total: { type: 'integer' },
                      page: { type: 'integer' },
                      totalPages: { type: 'integer' },
                      conversations: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/Conversation' },
                      },
                    },
                  },
                },
              },
            },
            401: { description: 'Unauthorized' },
            500: { description: 'Internal server error' },
          },
        },
        post: {
          tags: ['Conversations'],
          summary: 'Create a new conversation (direct or group)',
          description: 'All participants must be friends with the creator. For direct, exactly 1 participant. For group, requires `groupName`.',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['type', 'participantIds'],
                  properties: {
                    type: { type: 'string', enum: ['direct', 'group'], example: 'direct' },
                    participantIds: {
                      type: 'array',
                      items: { type: 'string' },
                      example: ['665f1a2b3c4d5e6f7a8b9c0d'],
                    },
                    groupName: { type: 'string', example: 'Team Chat', description: 'Required when type is group' },
                  },
                },
              },
            },
          },
          responses: {
            201: {
              description: 'Conversation created or retrieved',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      message: { type: 'string' },
                      conversation: { $ref: '#/components/schemas/Conversation' },
                    },
                  },
                },
              },
            },
            400: { description: 'Validation error (invalid type, non-friend participants, etc.)' },
            401: { description: 'Unauthorized' },
            500: { description: 'Internal server error' },
          },
        },
      },
      '/api/conversation/{conversationId}/messages': {
        get: {
          tags: ['Conversations'],
          summary: 'Get messages in a conversation (cursor-based pagination)',
          parameters: [
            { name: 'conversationId', in: 'path', required: true, schema: { type: 'string' } },
            { name: 'limit', in: 'query', schema: { type: 'integer', default: 50 }, description: 'Number of messages per page' },
            { name: 'cursor', in: 'query', schema: { type: 'string' }, description: 'ISO date string from previous `nextCursor` to fetch older messages' },
          ],
          responses: {
            200: {
              description: 'Messages ordered oldest → newest',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      count: { type: 'integer' },
                      limit: { type: 'integer' },
                      messages: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/Message' },
                      },
                      nextCursor: {
                        type: 'string',
                        nullable: true,
                        description: 'Pass as `cursor` param to fetch next (older) page. null when no more pages.',
                      },
                    },
                  },
                },
              },
            },
            400: { description: 'Invalid conversationId' },
            403: { description: 'User is not a participant of this conversation' },
            401: { description: 'Unauthorized' },
            500: { description: 'Internal server error' },
          },
        },
      },

      // ── MESSAGES ─────────────────────────────────────────────────────────────
      '/api/messages/direct': {
        post: {
          tags: ['Messages'],
          summary: 'Send a direct message',
          description: 'Sender and recipient must be friends (`checkFriendShip` middleware).',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['conversationId', 'content'],
                  properties: {
                    conversationId: { type: 'string', example: '665f1a2b3c4d5e6f7a8b9c0d' },
                    content: { type: 'string', example: 'Hey there!' },
                    imgeUrl: { type: 'string', example: 'https://cdn.example.com/img.jpg' },
                  },
                },
              },
            },
          },
          responses: {
            201: {
              description: 'Message sent',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Message' },
                },
              },
            },
            400: { description: 'Validation error' },
            401: { description: 'Unauthorized' },
            403: { description: 'Not friends with recipient' },
            500: { description: 'Internal server error' },
          },
        },
      },
      '/api/messages/group': {
        post: {
          tags: ['Messages'],
          summary: 'Send a group message',
          description: 'Sender must be a member of the group (`checkGroupMembership` middleware).',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['conversationId', 'content'],
                  properties: {
                    conversationId: { type: 'string', example: '665f1a2b3c4d5e6f7a8b9c0d' },
                    content: { type: 'string', example: 'Hello group!' },
                    imgeUrl: { type: 'string' },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: 'Message sent' },
            401: { description: 'Unauthorized' },
            403: { description: 'Not a group member' },
            500: { description: 'Internal server error' },
          },
        },
      },
    },
  },
  apis: [],
};

export const swaggerSpec = swaggerJsdoc(options);
