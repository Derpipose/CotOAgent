export const tools = [
  {
    name: 'log_message',
    description: 'Logs a message to the console',
    parameters: {
      type: 'object',
      properties: {
        message: { type: 'string', description: 'The message to log' }
      },
      required: ['message']
    }
  },
  {
    name: 'create_new_character',
    description: 'Creates a new character if the user has a name for the character.',
    parameters: {
      type: 'object',
      properties: {
        character_name: { type: 'string', description: 'The name of the character to create' }
      },
      required: ['character_name']
    }
  },
  {
    name: 'get_closest_classes_to_description',
    description: 'Retrieves the 10 closest matching classes based on a description provided.',
    parameters: {
      type: 'object',
      properties: {
        description: { type: 'string', description: 'The description to match classes against' }
      },
      required: ['description']
    }
  },
  {
    name: 'get_how_to_play_classes',
    description: 'Retrieves information on how to play the classes available in the Chronicles of the Omuns.',
    parameters: {
      type: 'object',
      properties: {}
    }
  },
  {
    name: 'get_closest_races_to_description',
    description: 'Retrieves the 10 closest matching races available in the Chronicles of the Omuns.',
    parameters: {
      type: 'object',
      properties: {
        description: { type: 'string', description: 'The description to match races against' }
      },
      required: ['description']
    }
  },
  {
    name: 'assign_character_race',
    description: 'Assigns a race to a character based on either the last created character id or a given character id and the race that the user has provided or the last suggested race. The user must approve of the character race assignment before calling this tool.',
    parameters: {
      type: 'object',
      properties: {
        character_id: { type: 'string', description: 'The ID of the character to assign the race to. If not provided, the last created character will be used.' },
        race_name: { type: 'string', description: 'The name of the race to assign to the character. If not provided, the last suggested race will be used.' }
      },
      required: ['character_id', 'race_name'] 
    }
  },
  {
    name: 'assign_character_class',
    description: 'Assigns a class to a character. Must be called before assigning a race. User must approve of the character class assignment before calling this tool.',
    parameters: {
      type: 'object',
      properties: {
        character_id: { type: 'string', description: 'The ID of the character to assign the class to.' },
        class_name: { type: 'string', description: 'The name of the class to assign to the character.' }
      },
      required: ['character_id', 'class_name'] 
    }
  },
  {
    name: 'get_stats_to_assign',
    description: 'Gets 6 random numbers to assign to the character stats. This must be done before being able to ',
    parameters: {
      type: 'object',
      properties: {}
    }
  },
  {
    name: 'assign_character_stats',
    description: 'Assigns stats to a character based on the last created character or a given character id. Look at the given character class if you have it and use that as a guide as to how to assign the stats optimally.',
    parameters: {
      type: 'object',
      properties: {
        character_id: { type: 'string', description: 'The ID of the character to assign the stats to. If not provided, the last created character will be used.' },
        stats: { 
          type: 'object',
          description: 'An object containing the stats to assign to the character.',
          properties: {
            Strength: { type: 'number' },
            Dexterity: { type: 'number' },
            Constitution: { type: 'number' },
            Intelligence: { type: 'number' },
            Wisdom: { type: 'number' },
            Charisma: { type: 'number' }
          },
          required: ['Strength', 'Dexterity', 'Constitution', 'Intelligence', 'Wisdom', 'Charisma']
        }
      },
      required: ['character_id', 'stats'] 
    }
  },
  {
    name: 'submit_character_for_approval',
    description: 'Submits a character for approval via Discord. Must be called after all character details are complete.',
    parameters: {
      type: 'object',
      properties: {
        character_id: { type: 'string', description: 'The ID of the character to submit for approval.' }
      },
      required: ['character_id']
    }
  },
  {
    name: 'revise_character_based_on_dm_feedback',
    description: 'Revises a character based on DM feedback and updates the character.',
    parameters: {
      type: 'object',
      properties: {
        character_id: { type: 'string', description: 'The ID of the character to revise.' },
        name: { type: 'string', description: 'The updated character name.' },
        class: { type: 'string', description: 'The updated character class.' },
        race: { type: 'string', description: 'The updated character race.' },
        stats: { 
          type: 'object',
          description: 'An object containing the updated stats for the character.',
          properties: {
            Strength: { type: 'number' },
            Dexterity: { type: 'number' },
            Constitution: { type: 'number' },
            Intelligence: { type: 'number' },
            Wisdom: { type: 'number' },
            Charisma: { type: 'number' }
          },
          required: ['Strength', 'Dexterity', 'Constitution', 'Intelligence', 'Wisdom', 'Charisma']
        }
      },
      required: ['character_id', 'name', 'class', 'race', 'stats']
    }
  },
  {
    name: 'get_character',
    description: 'Retrieves a character by ID or gets all characters for the current user.',
    parameters: {
      type: 'object',
      properties: {
        character_id: { type: 'string', description: 'The ID of a specific character to retrieve. If not provided, all characters for the current user will be returned.' }
      },
      required: []
    }
  }
]
