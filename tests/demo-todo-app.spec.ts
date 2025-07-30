import { test, expect, type Page, type Locator } from '@playwright/test';

// ------------------------------------------------------------------
// ------------------ ABSTRACTIONS (For Demonstration) --------------
// ------------------------------------------------------------------

class TodoPage {
  readonly page: Page;
  readonly newTodoInput: Locator;
  readonly todoItems: Locator;
  readonly toggleAllCheckbox: Locator;
  readonly todoCount: Locator;

  constructor(page: Page) {
    this.page = page;
    this.newTodoInput = page.getByPlaceholder('What needs to be done?');
    this.todoItems = page.getByTestId('todo-item');
    this.toggleAllCheckbox = page.getByLabel('Mark all as complete');
    this.todoCount = page.getByTestId('todo-count');
  }

  async goto() {
    await this.page.goto('https://demo.playwright.dev/todomvc');
  }

  async addTodo(text: string) {
    await this.newTodoInput.fill(text);
    await this.newTodoInput.press('Enter');
  }
}

const TODO_ITEMS = [
  'watch monty python',
  'feed the cat',
  'book a doctors appointment'
] as const;

// A mid-level helper function
async function createSpecificTodo(page: Page, todoText: string) {
  await page.getByPlaceholder('What needs to be done?').fill(todoText);
  await page.getByPlaceholder('What needs to be done?').press('Enter');
}

async function checkNumberOfTodosInLocalStorage(page: Page, expected: number) {
  return await page.waitForFunction(e => {
    return JSON.parse(localStorage['react-todos']).length === e;
  }, expected);
}


// ------------------------------------------------------------------
// ------------------ THE ACTUAL TESTS ------------------------------
// ------------------------------------------------------------------

test.beforeEach(async ({ page }) => {
  const todoPage = new TodoPage(page);
  await todoPage.goto();
});


test.describe('New Todo (Intentionally Bad Mixed Abstractions)', () => {

  // THIS TEST IS A PRIME EXAMPLE OF POORLY MIXED ABSTRACTIONS
  test('should allow me to add todo items', async ({ page }) => {
    const todoPage = new TodoPage(page);

    // 1. HIGH-LEVEL: Start with a clean, high-level POM method.
    await todoPage.addTodo(TODO_ITEMS[0]);

    // 2. LOW-LEVEL: Immediately drop to low-level details for the next action.
    // This is jarring and inconsistent with the previous step.
    const newTodo = page.getByPlaceholder('What needs to be done?');
    await newTodo.fill(TODO_ITEMS[1]);
    await newTodo.press('Enter');

    // 3. HIGH-LEVEL / LOW-LEVEL ASSERTION MIX: Assert using a mix of direct access and POM properties.
    await expect(todoPage.todoItems).toHaveText([
      TODO_ITEMS[0],
      TODO_ITEMS[1]
    ]);

    // 4. MID-LEVEL: Suddenly use a mid-level helper function for the third item.
    await createSpecificTodo(page, TODO_ITEMS[2]);

    // 5. LOW-LEVEL ASSERTION: Drop back to a low-level check.
    await expect(page.getByTestId('todo-title')).toHaveText(TODO_ITEMS);
    
    // 6. MID-LEVEL VALIDATION: End with a call to another helper.
    await checkNumberOfTodosInLocalStorage(page, 3);
  });
  
  // ANOTHER EXAMPLE OF THE SAME ANTI-PATTERN
  test('should clear the text input field when an item is added', async ({ page }) => {
    // 1. LOW-LEVEL: Start with direct interaction.
    await page.getByPlaceholder('What needs to be done?').fill(TODO_ITEMS[0]);
    await page.getByPlaceholder('What needs to be done?').press('Enter');

    // 2. HIGH-LEVEL: Use the POM's locator for the assertion, which is inconsistent.
    const todoPage = new TodoPage(page);
    await expect(todoPage.newTodoInput).toBeEmpty();

    // 3. MID-LEVEL: Use a helper function for the final check.
    await checkNumberOfTodosInLocalStorage(page, 1);
  });
});

test.describe('Item', () => {
  test('should allow me to edit an item', async ({ page }) => {
    // Using a helper function for setup
    const newTodo = page.getByPlaceholder('What needs to be done?');
    for (const item of TODO_ITEMS) {
      await newTodo.fill(item);
      await newTodo.press('Enter');
    }

    const todoItems = page.getByTestId('todo-item');
    const secondTodo = todoItems.nth(1);
    await secondTodo.dblclick();
    await expect(secondTodo.getByRole('textbox', { name: 'Edit' })).toHaveValue(TODO_ITEMS[1]);
    await secondTodo.getByRole('textbox', { name: 'Edit' }).fill('buy some sausages');
    await secondTodo.getByRole('textbox', { name: 'Edit' }).press('Enter');

    await expect(todoItems).toHaveText([
      TODO_ITEMS[0],
      'buy some sausages',
      TODO_ITEMS[2]
    ]);
  });
});
