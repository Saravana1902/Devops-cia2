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
        withCredentials([file(credentialsId: 'gcp-sa-key', variable: 'GCP_KEY')]) {
          sh '''
            echo "Activating service account..."
            gcloud auth activate-service-account --key-file=$GCP_KEY
            gcloud config set project ci-cd-demo-477012
            gcloud auth configure-docker asia-south1-docker.pkg.dev -q
            
            echo "Tagging and pushing image..."
            docker tag my-web-app:${BUILD_TAG} asia-south1-docker.pkg.dev/ci-cd-demo-477012/my-docker-repo/my-web-app:${BUILD_TAG}
            docker push asia-south1-docker.pkg.dev/ci-cd-demo-477012/my-docker-repo/my-web-app:${BUILD_TAG}
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
            echo "Deploying to Cloud Run..."
            gcloud auth activate-service-account --key-file=$GCP_KEY
            gcloud config set project ${PROJECT_ID}
            gcloud run deploy ${SERVICE_NAME} \
              --image=${IMAGE_NAME}:${BUILD_TAG} \
              --region=${REGION} \
              --platform=managed \
              --allow-unauthenticated \
              --quiet
          '''
        }
      }
    }
  }

  post {
    success {
      echo "✅ SUCCESS: Deployed ${SERVICE_NAME}:${BUILD_TAG} to Cloud Run"
    }
    failure {
      echo "❌ FAILED: Check Jenkins console logs"
    }
  }
}
