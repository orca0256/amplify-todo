import { useEffect, useState } from "react";
import { useAuthenticator } from "@aws-amplify/ui-react";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "../amplify/data/resource";

const client = generateClient<Schema>();

/* -------------------------------- TodoList ------------------------------- */
function TodoList() {
  const [todos, setTodos] = useState<Schema["Todo"]["type"][]>([]);

  /* --- リアルタイム購読（mount → subscribe, unmount → unsubscribe） --- */
  useEffect(() => {
    const sub = client.models.Todo.observeQuery().subscribe({
      next: ({ items }) => setTodos([...items]),
    });
    return () => sub.unsubscribe();
  }, []);

  /* ------------------------- CRUD アクション ------------------------- */
  const createTodo = async () => {
    const content = window.prompt("Todo content?");
    if (!content) return; // Cancel / 空文字は無視
    await client.models.Todo.create({ content, isDone: false });
    // observeQuery がトリガーされるので setState は不要
  };

  const deleteTodo = async (id: string) => {
    /* ワンクリック削除。必要なら confirm を挟む */
    await client.models.Todo.delete({ id });
    // observeQuery がトリガーされるので setState は不要
  };

  /* ------------------------------ UI ------------------------------ */
  return (
    <section>
      <button onClick={createTodo}>+ new</button>
      <ul>
        {todos.map(({ id, content }) => (
          <li key={id} onClick={() => deleteTodo(id)}>
            {content}
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ---------------------------------- App ---------------------------------- */
export default function App() {
  const { user, signOut } = useAuthenticator();

  return (
    <main style={{ maxWidth: 480, margin: "0 auto", padding: "2rem" }}>
      <header style={{ display: "flex", justifyContent: "space-between" }}>
        <h1>{user?.signInDetails?.loginId}'s todos</h1>
        <button onClick={signOut}>Sign out</button>
      </header>

      {/* Todo 管理本体 */}
      <TodoList />

      {/* チュートリアルリンク：元コードのコメントを残す */}
      <footer style={{ marginTop: "2rem", fontSize: "0.9rem" }}>
        🥳 App successfully hosted. Try creating a new todo.
        <br />
        <a
          href="https://docs.amplify.aws/react/start/quickstart/#make-frontend-updates"
          target="_blank"
          rel="noreferrer"
        >
          Review next step of this tutorial.
        </a>
      </footer>
    </main>
  );
}


export default App;
