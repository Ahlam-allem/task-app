<?php

namespace App\Http\Controllers;

use App\Models\Task;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class TaskController extends Controller
{
    private $externalApiUrl = 'https://jsonplaceholder.typicode.com/todos';

    public function index()
    {
        try {
            // Fetch local tasks with most recent first
            $localTasks = Task::orderBy('created_at', 'desc')
                ->get()
                ->map(function($task) {
                    return [
                        'id' => $task->id,
                        'external_id' => $task->external_id,
                        'title' => $task->title,
                        'completed' => $task->completed,
                        'source' => 'local'
                    ];
                });
            
            try {
                $response = Http::timeout(5)->get($this->externalApiUrl);
                
                if (!$response->successful()) {
                    throw new \Exception('External API returned status: ' . $response->status());
                }

                $externalTasks = collect($response->json())
                    ->take(10)
                    ->map(function($task) {
                        return [
                            'id' => null,
                            'external_id' => $task['id'],
                            'title' => $task['title'],
                            'completed' => $task['completed'],
                            'source' => 'external'
                        ];
                    });
            } catch (\Exception $e) {
                \Log::error('External API fetch failed: ' . $e->getMessage());
                $externalTasks = collect([]);
            }

            return response()->json([
                'status' => 'success',
                'local_tasks' => $localTasks,
                'external_tasks' => $externalTasks
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to retrieve tasks',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'title' => 'required|string|max:255',
                'completed' => 'required|boolean'
            ]);

            $task = Task::create($validated);

            try {
                $response = Http::timeout(5)->post($this->externalApiUrl, [
                    'title' => $request->title,
                    'completed' => $request->completed,
                    'userId' => 1
                ]);

                if (!$response->successful()) {
                    throw new \Exception('External API returned status: ' . $response->status());
                }

                $externalData = $response->json();
                $task->external_id = $externalData['id'];
                $task->save();
                
            } catch (\Exception $e) {
                \Log::error('External API sync failed: ' . $e->getMessage());
            }

            return response()->json([
                'status' => 'success',
                'data' => [
                    'id' => $task->id,
                    'external_id' => $task->external_id,
                    'title' => $task->title,
                    'completed' => $task->completed,
                    'created_at' => $task->created_at
                ]
            ], 201);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to create task',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }
}