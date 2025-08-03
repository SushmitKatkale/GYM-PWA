<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once 'config/database.php';
require_once 'config/response.php';
require_once 'controllers/GymController.php';
require_once 'controllers/OwnerController.php';
require_once 'controllers/UserController.php';
require_once 'controllers/AuthController.php';

// Parse request URI and method
$request_uri = $_SERVER['REQUEST_URI'];
$request_method = $_SERVER['REQUEST_METHOD'];

// Remove query string and decode URI
$path = parse_url($request_uri, PHP_URL_PATH);
$path = urldecode($path);

// Remove /api prefix if present
$path = preg_replace('#^/api#', '', $path);

// Split path into segments
$segments = array_filter(explode('/', $path));
$segments = array_values($segments); // Re-index array

try {
    // Route handling
    if (empty($segments)) {
        Response::success(['message' => 'Gym Management API v1.0']);
        exit();
    }

    $resource = $segments[0];
    $id = isset($segments[1]) ? $segments[1] : null;
    $subresource = isset($segments[2]) ? $segments[2] : null;

    switch ($resource) {
        case 'gyms':
            $controller = new GymController();
            break;
        
        case 'owners':
            $controller = new OwnerController();
            break;
        
        case 'users':
            $controller = new UserController();
            break;
        
        case 'auth':
            $controller = new AuthController();
            break;
        
        default:
            Response::error('Resource not found', 404);
            exit();
    }

    // Call appropriate method based on HTTP method and resource
    switch ($request_method) {
        case 'GET':
            if ($id) {
                if ($subresource) {
                    // Handle nested resources like /gyms/{id}/subscriptions
                    $controller->getSubResource($id, $subresource);
                } else {
                    $controller->getById($id);
                }
            } else {
                $controller->getAll();
            }
            break;
        
        case 'POST':
            $controller->create();
            break;
        
        case 'PUT':
            if ($id) {
                $controller->update($id);
            } else {
                Response::error('ID required for PUT request', 400);
            }
            break;
        
        case 'DELETE':
            if ($id) {
                $controller->delete($id);
            } else {
                Response::error('ID required for DELETE request', 400);
            }
            break;
        
        default:
            Response::error('Method not allowed', 405);
            break;
    }

} catch (Exception $e) {
    error_log("API Error: " . $e->getMessage());
    Response::error('Internal server error: ' . $e->getMessage(), 500);
}
?>
