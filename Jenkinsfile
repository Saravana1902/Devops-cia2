pipeline {
  agent any

  environment {
    PROJECT_ID = 'ci-cd-demo-477012'
    REGION = 'asia-south1'
    REPO = 'my-docker-repo'
    SERVICE_NAME = 'my-web-app'
    IMAGE_NAME = "${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPO}/${SERVICE_NAME}"
    GCP_SA_CRED_ID = 'gcp-sa-key'
    BUILD_TAG = "${env.BUILD_NUMBER}"
  }

  stages {

    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Install dependencies & Test') {
      steps {
        sh 'node -v || true'
        sh 'npm install || true'
        sh 'npm test || true'
      }
    }

    stage('Build Docker image') {
      steps {
        sh "docker build -t ${SERVICE_NAME}:${BUILD_TAG} ."
      }
    }

    stage('Push to Artifact Registry') {
      steps {
        withCredentials([file(credentialsId: "${GCP_SA_CRED_ID}", variable: 'GCP_KEY')]) {
          sh '''
            echo "🔑 Activating service account..."
            gcloud auth activate-service-account --key-file=$GCP_KEY
            gcloud config set project ${PROJECT_ID}
            gcloud auth configure-docker ${REGION}-docker.pkg.dev -q

            echo "📦 Tagging and pushing image..."
            docker tag ${SERVICE_NAME}:${BUILD_TAG} ${IMAGE_NAME}:${BUILD_TAG}
            docker push ${IMAGE_NAME}:${BUILD_TAG}
          '''
        }
      }
    }

    stage('Verify GCP Auth') {
      steps {
        sh 'gcloud auth list'
      }
    }

    stage('Deploy to Cloud Run') {
      steps {
        withCredentials([file(credentialsId: "${GCP_SA_CRED_ID}", variable: 'GCP_KEY')]) {
          sh '''
            echo "🚀 Deploying to Cloud Run..."
            gcloud auth activate-service-account --key-file=$GCP_KEY
            gcloud config set project ${PROJECT_ID}

            gcloud run deploy ${SERVICE_NAME} \
              --image=${IMAGE_NAME}:${BUILD_TAG} \
              --region=${REGION} \
              --platform=managed \
              --allow-unauthenticated \
              --quiet

            echo "✅ Cloud Run deployment complete."
          '''
        }
      }
    }

    stage('Enable Monitoring & Logging') {
      steps {
        withCredentials([file(credentialsId: "${GCP_SA_CRED_ID}", variable: 'GCP_KEY')]) {
          sh '''
            echo "📊 Enabling Cloud Monitoring and Logging..."
            gcloud auth activate-service-account --key-file=$GCP_KEY
            gcloud config set project ${PROJECT_ID}

            # Enable monitoring/logging APIs (only needed once per project)
            gcloud services enable monitoring.googleapis.com logging.googleapis.com

            # List active log sinks for verification
            gcloud logging sinks list

            # Check recent logs for the deployed service
            gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=${SERVICE_NAME}" --limit=5 --format="value(textPayload)"
          '''
        }
      }
    }
  }

  post {
    success {
      echo "✅ SUCCESS: Deployed ${SERVICE_NAME}:${BUILD_TAG} to Cloud Run"

      // Send email notification on success
      mail to: 'youremail@example.com',
           subject: "✅ SUCCESS: ${env.JOB_NAME} Build #${env.BUILD_NUMBER}",
           body: """Hello,

Good news! Your Jenkins pipeline completed successfully.

✅ Deployment Details:
• Service: ${SERVICE_NAME}
• Build Tag: ${BUILD_TAG}
• Project: ${PROJECT_ID}
• Region: ${REGION}

View the build logs here:
${env.BUILD_URL}

Regards,
Your Jenkins CI/CD Bot
"""
    }

    failure {
      echo "❌ FAILED: Check Jenkins console logs"

      // Send email notification on failure
      mail to: 'youremail@example.com',
           subject: "❌ FAILURE: ${env.JOB_NAME} Build #${env.BUILD_NUMBER}",
           body: """Hello,

Unfortunately, the Jenkins pipeline failed during deployment.

❗ Service: ${SERVICE_NAME}
❗ Build Tag: ${BUILD_TAG}
❗ Project: ${PROJECT_ID}

Check the Jenkins logs for details:
${env.BUILD_URL}

-- Jenkins CI/CD Bot
"""
    }
  }
}
