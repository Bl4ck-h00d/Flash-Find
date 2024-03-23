Thunder Search ⚡: Parallel Search Optimization with Web Workers
This project addresses the performance challenges associated with client-side search operations as the dataset grows or when using complex search algorithms. In scenarios where traditional approaches fail to provide satisfactory performance, this project offers a solution by leveraging web workers for parallel processing.

Problem Statement
You have a client-side search implemented using various search algorithms, which performs well initially. However, as your dataset grows or when dealing with more complex search requirements, performance begins to degrade. Tweaking search options can only provide marginal improvements, and attempts to enhance user experience through techniques like input debouncing prove insufficient. Eventually, the application freezes or becomes unresponsive during search operations, resulting in a degraded user experience.

You are reluctant to abandon search functionality or migrate the client-side search to the server, as these solutions would compromise the user experience or introduce additional complexity and latency. Instead, you seek a solution that allows for efficient client-side search processing without blocking the main thread or sacrificing search capabilities.

Solution
This project offers a solution by utilizing web workers for parallel processing of search tasks. By distributing search operations among multiple worker threads, the application can leverage the computational resources of modern multi-core processors more effectively. This approach allows for faster search performance without blocking the main thread or compromising search capabilities.

Features
Utilizes web workers to perform search tasks in parallel.
Dynamically estimates the number of logical cores available on the user's machine.
Splits the search data into chunks based on the number of available logical cores.
Distributes search tasks among worker threads for concurrent execution.
Aggregates search results from multiple worker threads to generate the final result.
