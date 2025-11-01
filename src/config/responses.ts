export interface ResponseSet {
  responses: string[];
}

export interface Responses {
  registration: {
    commandDescription: string;
    modalTitle: string;
    modalPlaceholder: string;
    serverOnlyError: ResponseSet;
    permissionError: ResponseSet;
    validation: {
      emptyName: ResponseSet;
      nameTooLong: ResponseSet;
    };
    success: {
      firstTime: {
        title: string;
        description: ResponseSet;
      };
      reRegistration: {
        title: string;
        description: ResponseSet;
      };
    };
    genericError: ResponseSet;
  };
  errors: {
    commandExecution: ResponseSet;
    modalSubmission: ResponseSet;
  };
  admin: {
    listUsers: {
      commandDescription: string;
      title: string;
      noUsers: ResponseSet;
      permissionDenied: ResponseSet;
    };
    deleteUser: {
      confirmButtonLabel: string;
      success: ResponseSet;
      error: ResponseSet;
      notFound: ResponseSet;
      permissionDenied: ResponseSet;
    };
  };
}

export const responses: Responses = {
  registration: {
    commandDescription: "Register your snail with BigNickBot",
    modalTitle: "Register with BigNickBot",
    modalPlaceholder: "Your in-game name",
    serverOnlyError: {
      responses: [
        "This command can only be used in a server.",
        "Sorry, but this only works in servers. Not here.",
        "Nope. This is a server-only command. Try that again in a server.",
      ],
    },
    permissionError: {
      responses: [
        "You don't have permission to use this command. You need the member or admin role.",
        "Access denied. You need to be a member or admin to use this.",
        "Not happening. You need the member or admin role first.",
      ],
    },
    validation: {
      emptyName: {
        responses: [
          "Nice try, but that name doesn't work. Try again when you've got your act together.",
          "What, you thought I'd accept an empty name? Come back when you've decided on something.",
          "Nope. Empty names aren't a thing here. Try again.",
          "That's not a name. That's nothing. Try actually entering something.",
        ],
      },
      nameTooLong: {
        responses: [
          "That name is too long. Keep it under 100 characters, will you?",
          "Slow down there, Shakespeare. Keep it under 100 characters.",
          "Too long. Maximum 100 characters, please.",
          "Nope, that's way too long. Trim it down to 100 characters or less.",
        ],
      },
    },
    success: {
      firstTime: {
        title: "Welcome!",
        description: {
          responses: [
            "Well, well, look who decided to join us. Welcome, {inGameName}. Try not to mess this up.",
            "Oh great, another one. Welcome, {inGameName}. Don't disappoint me.",
            "Look what the cat dragged in. Welcome, {inGameName}. Try to keep up.",
            "Well, you finally made it. Welcome, {inGameName}. Let's see how long this lasts.",
          ],
        },
      },
      reRegistration: {
        title: "Name Updated",
        description: {
          responses: [
            "Changed your mind about your name, did you? Fine, you're now {inGameName}. Don't make me update this again.",
            "Oh, we're changing names now? Alright, you're {inGameName} now. Happy?",
            "Fine, I'll update it. You're {inGameName} now. Try to stick with this one.",
            "Again? Really? Fine. {inGameName} it is. Let's not do this every week.",
          ],
        },
      },
    },
    genericError: {
      responses: [
        "Something went wrong. Try again later.",
        "Well that didn't work. Give it another shot.",
        "Error. Try again, I guess.",
        "That failed spectacularly. Try once more.",
      ],
    },
  },
  errors: {
    commandExecution: {
      responses: [
        "There was an error while executing this command!",
        "Well, that didn't work. Something broke.",
        "Command failed. Try again or something.",
        "Error executing command. Surprise.",
      ],
    },
    modalSubmission: {
      responses: [
        "There was an error processing your submission!",
        "Something broke while processing that. Try again.",
        "Error processing submission. What a shock.",
        "That submission didn't work. Try once more.",
      ],
    },
  },
  admin: {
    listUsers: {
      commandDescription: "List all registered users (admin only)",
      title: "Registered Users",
      noUsers: {
        responses: [
          "No one's registered yet. Impressive.",
          "Nobody here. The place is empty.",
          "Zero registrations. Starting from scratch, are we?",
        ],
      },
      permissionDenied: {
        responses: [
          "You don't have permission to use this command.",
          "Nope. Admin only. You're not admin.",
          "Access denied. Get yourself some admin privileges first.",
        ],
      },
    },
    deleteUser: {
      confirmButtonLabel: "Delete",
      success: {
        responses: [
          "User deleted. They're gone now.",
          "Deleted. One less user to worry about.",
          "User removed. Good riddance.",
          "They're gone. Deleted successfully.",
        ],
      },
      error: {
        responses: [
          "Failed to delete user. Something went wrong.",
          "Couldn't delete that user. Try again.",
          "Error deleting user. Oops.",
        ],
      },
      notFound: {
        responses: [
          "User not found. Already deleted?",
          "Couldn't find that user. Maybe they're already gone?",
          "User doesn't exist. Check the ID.",
        ],
      },
      permissionDenied: {
        responses: [
          "You don't have permission to do that.",
          "Admin only. You're not admin.",
          "Not happening. You need admin privileges.",
        ],
      },
    },
  },
};
