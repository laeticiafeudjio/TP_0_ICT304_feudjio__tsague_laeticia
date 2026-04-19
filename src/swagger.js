module.exports = {
  openapi: '3.0.0',
  info: {
    title: 'TP304 API',
    version: '1.0.0',
    description: 'Documentation Swagger pour le test logiciel de l’API bancaire',
  },
// ✅ CODE CORRIGÉ (utilise Render)
  servers: [
    {
      url: 'https://votre-service.onrender.com/api/v1',
      description: 'Serveur Render',
    },
   
  ],
  paths: {
    '/clients': {
      get: {
        summary: 'Lister les clients',
        responses: {
          '200': {
            description: 'Liste des clients',
          },
        },
      },
      post: {
        summary: 'Créer un client',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/NewClient',
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Client créé',
          },
        },
      },
    },
    '/clients/{id}': {
      get: {
        summary: 'Récupérer un client par ID',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: {
              type: 'integer',
            },
          },
        ],
        responses: {
          '200': {
            description: 'Client trouvé',
          },
          '404': {
            description: 'Client non trouvé',
          },
        },
      },
    },
    '/comptes': {
      get: {
        summary: 'Lister les comptes',
        responses: {
          '200': {
            description: 'Liste des comptes',
          },
        },
      },
      post: {
        summary: 'Créer un compte',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/NewAccount',
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Compte créé',
          },
        },
      },
    },
    '/comptes/{numero}': {
      get: {
        summary: 'Récupérer un compte par numéro',
        parameters: [
          {
            name: 'numero',
            in: 'path',
            required: true,
            schema: {
              type: 'string',
            },
          },
        ],
        responses: {
          '200': {
            description: 'Compte trouvé',
          },
          '404': {
            description: 'Compte non trouvé',
          },
        },
      },
    },
    '/transactions': {
      get: {
        summary: 'Lister les transactions',
        parameters: [
          {
            name: 'numero_compte',
            in: 'query',
            required: false,
            schema: {
              type: 'string',
            },
          },
        ],
        responses: {
          '200': {
            description: 'Liste des transactions',
          },
        },
      },
    },
    '/transactions/depot': {
      post: {
        summary: 'Effectuer un dépôt',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/TransactionRequest',
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Dépôt effectué',
          },
        },
      },
    },
    '/transactions/retrait': {
      post: {
        summary: 'Effectuer un retrait',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/TransactionRequest',
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Retrait effectué',
          },
        },
      },
    },
  },
  components: {
    schemas: {
      NewClient: {
        type: 'object',
        properties: {
          nom: { type: 'string' },
          prenom: { type: 'string' },
          email: { type: 'string' },
          telephone: { type: 'string' },
          adresse: { type: 'string' },
          date_naissance: { type: 'string', format: 'date' },
          numero_cni: { type: 'string' },
        },
        required: ['nom', 'prenom', 'email'],
      },
      NewAccount: {
        type: 'object',
        properties: {
          numero_compte: { type: 'string' },
          client_id: { type: 'integer' },
          type_compte_id: { type: 'integer' },
          solde: { type: 'number' },
          plafond_retrait: { type: 'number' },
          devise: { type: 'string' },
        },
        required: ['numero_compte', 'client_id', 'type_compte_id'],
      },
      TransactionRequest: {
        type: 'object',
        properties: {
          numero_compte: { type: 'string' },
          montant: { type: 'number' },
          description: { type: 'string' },
          canal: { type: 'string' },
        },
        required: ['numero_compte', 'montant'],
      },
    },
  },
};