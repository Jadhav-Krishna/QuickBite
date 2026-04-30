#!/bin/bash

echo "=== Jenkins Setup Script ==="

# Wait for Jenkins to be ready
echo "Waiting for Jenkins to start..."
until curl -s http://localhost:8080/login > /dev/null; do
    sleep 5
done

echo "Jenkins is up!"

# Get initial admin password
JENKINS_PASSWORD=$(docker exec quickbite-jenkins cat /var/jenkins_home/secrets/initialAdminPassword 2>/dev/null)

if [ -n "$JENKINS_PASSWORD" ]; then
    echo ""
    echo "=========================================="
    echo "Jenkins Initial Admin Password:"
    echo "$JENKINS_PASSWORD"
    echo "=========================================="
    echo ""
    echo "Access Jenkins at: http://localhost:8080"
    echo ""
    echo "Next steps:"
    echo "1. Open http://localhost:8080 in your browser"
    echo "2. Enter the password above"
    echo "3. Install suggested plugins"
    echo "4. Create your admin user"
    echo "5. Install additional plugins: Docker, Docker Pipeline, SonarQube Scanner"
    echo "6. Configure credentials (dockerhub-username, dockerhub-token, sonarqube-token)"
    echo "7. Create a Pipeline job pointing to your Jenkinsfile"
    echo ""
else
    echo "Jenkins is already configured. Access it at: http://localhost:8080"
fi
